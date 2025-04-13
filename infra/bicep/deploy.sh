#!/bin/bash
# deploy.sh - Script to deploy Arrow Tracker Azure development environment

# Set default values
ENVIRONMENT="dev"
LOCATION="westus2"
RESOURCE_GROUP="arrowtrack-$ENVIRONMENT-rg"

# Display help
function display_help() {
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  -h, --help                 Display this help message"
    echo "  -e, --environment ENV      Environment name (default: dev)"
    echo "  -l, --location LOCATION    Azure region (default: westus2)"
    echo "  -g, --resource-group NAME  Resource group name (default: arrowtrack-dev-rg)"
    echo "  -t, --tenant-name NAME     B2C tenant name (required)"
    echo "  -d, --destroy              Destroy resources instead of creating them"
    echo ""
}

# Parse arguments
DESTROY=false
B2C_TENANT_NAME=""

while [[ $# -gt 0 ]]; do
    key="$1"
    case $key in
        -h|--help)
            display_help
            exit 0
            ;;
        -e|--environment)
            ENVIRONMENT="$2"
            shift
            shift
            ;;
        -l|--location)
            LOCATION="$2"
            shift
            shift
            ;;
        -g|--resource-group)
            RESOURCE_GROUP="$2"
            shift
            shift
            ;;
        -t|--tenant-name)
            B2C_TENANT_NAME="$2"
            shift
            shift
            ;;
        -d|--destroy)
            DESTROY=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            display_help
            exit 1
            ;;
    esac
done

# Validate B2C tenant name if not destroying
if [[ "$DESTROY" == "false" && -z "$B2C_TENANT_NAME" ]]; then
    echo "Error: B2C tenant name (-t, --tenant-name) is required for deployment"
    display_help
    exit 1
fi

# Get the absolute path to the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INFRA_DIR="$(dirname "$SCRIPT_DIR")"
SCRIPTS_DIR="$INFRA_DIR/scripts"

# Generate deterministic Function App name
FUNCTION_APP_NAME="arrowtrack-${ENVIRONMENT}-func"

# Function to deploy resources
deploy_resources() {
    echo "=> Creating resource group: $RESOURCE_GROUP in $LOCATION"
    az group create --name "$RESOURCE_GROUP" --location "$LOCATION" --tags "environment=$ENVIRONMENT" "application=arrow-tracker"
    
    # Step 1: Create the B2C tenant
    echo "=> Creating B2C tenant: $B2C_TENANT_NAME.onmicrosoft.com"
    B2C_DISPLAY_NAME="Arrow Tracker $ENVIRONMENT"
    B2C_TENANT_ID=$("$SCRIPTS_DIR/create-b2c-tenant.sh" \
        --display-name "$B2C_DISPLAY_NAME" \
        --tenant-name "$B2C_TENANT_NAME" \
        --resource-group "$RESOURCE_GROUP" \
        --location "$LOCATION")
    
    if [[ $? -ne 0 || -z "$B2C_TENANT_ID" ]]; then
        echo "Error: Failed to create B2C tenant. See above for details."
        exit 1
    fi
    
    echo "=> B2C tenant created with ID: $B2C_TENANT_ID"
    
    # Step 2: Create the B2C application
    echo "=> Creating B2C application"
    APP_DISPLAY_NAME="Arrow Tracker $ENVIRONMENT"
    # Use deterministic Function App URL instead of wildcard
    REPLY_URLS="http://localhost:3000,https://localhost:3000,https://${FUNCTION_APP_NAME}.azurewebsites.net"
    
    #echo the command about to be run first
    echo "=> Running: $SCRIPTS_DIR/create-b2c-app.sh --tenant-name $B2C_TENANT_NAME --app-name $APP_DISPLAY_NAME --reply-urls $REPLY_URLS"

    B2C_APP_ID=$("$SCRIPTS_DIR/create-b2c-app.sh" \
        --tenant-name "$B2C_TENANT_NAME" \
        --app-name "$APP_DISPLAY_NAME" \
        --reply-urls "$REPLY_URLS")
    
    if [[ $? -ne 0 || -z "$B2C_APP_ID" ]]; then
        echo "Error: Failed to create B2C application. See above for details."
        exit 1
    fi
    
    echo "=> B2C application created with ID: $B2C_APP_ID"
    
    # Step 3: Check for existing Cosmos DB free tier accounts
    echo "=> Checking for existing Cosmos DB free tier accounts"
    COSMOS_FREE_TIER=$("$SCRIPTS_DIR/check-cosmos-free-tier.sh")
    echo "=> Cosmos DB free tier status: $COSMOS_FREE_TIER"
    
    # Step 4: Deploy infrastructure with Bicep
    echo "=> Deploying infrastructure with Bicep"
    echo "az deployment group create --name arrowtrack-$ENVIRONMENT-deployment --resource-group $RESOURCE_GROUP --template-file \"$SCRIPT_DIR/main.bicep\" --parameters environmentName=$ENVIRONMENT location=$LOCATION b2cTenantName=$B2C_TENANT_NAME b2cAppId=$B2C_APP_ID cosmosDbFreeTier=$COSMOS_FREE_TIER functionAppName=$FUNCTION_APP_NAME --output table"

    az deployment group create \
        --name "arrowtrack-$ENVIRONMENT-deployment" \
        --resource-group "$RESOURCE_GROUP" \
        --template-file "$SCRIPT_DIR/main.bicep" \
        --parameters environmentName="$ENVIRONMENT" location="$LOCATION" b2cTenantName="$B2C_TENANT_NAME" b2cAppId="$B2C_APP_ID" cosmosDbFreeTier=$COSMOS_FREE_TIER functionAppName="$FUNCTION_APP_NAME" \
        --output table
    
    if [[ $? -ne 0 ]]; then
        echo "Error: Failed to deploy infrastructure. See above for details."
        exit 1
    fi
    
    # Step 5: Set up B2C policies
    echo "=> Setting up B2C policies"
    "$SCRIPT_DIR/setup-b2c-policies.sh" \
        --tenant-name "$B2C_TENANT_NAME" \
        --app-id "$B2C_APP_ID"
    
    echo "=> Deployment complete!"
    echo "=> Resource group: $RESOURCE_GROUP"
    echo "=> B2C tenant: $B2C_TENANT_NAME.onmicrosoft.com"
    echo "=> B2C application ID: $B2C_APP_ID"
}

# Function to destroy resources
destroy_resources() {
    echo "=> WARNING: This will delete all resources in resource group: $RESOURCE_GROUP"
    read -p "Are you sure you want to continue? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "=> Deleting resource group: $RESOURCE_GROUP"
        az group delete --name "$RESOURCE_GROUP" --yes --no-wait
        echo "=> Resource group deletion initiated. This will take a few minutes."
        echo "=> To check status: az group show -n $RESOURCE_GROUP"
        
        if [[ -n "$B2C_TENANT_NAME" ]]; then
            echo "=> NOTE: The B2C tenant ($B2C_TENANT_NAME.onmicrosoft.com) must be deleted manually from the Azure portal."
            echo "=> Azure AD B2C tenants cannot be deleted programmatically and require manual intervention."
        fi
    else
        echo "=> Destruction cancelled"
    fi
}

# Check Azure CLI installation and login status
if ! command -v az &> /dev/null; then
    echo "Error: Azure CLI is not installed. Please install it first."
    exit 1
fi

# Check if user is logged in
if ! az account show &> /dev/null; then
    echo "=> You are not logged in to Azure. Please login."
    az login
fi

# Make scripts executable
chmod +x "$SCRIPTS_DIR/create-b2c-tenant.sh"
chmod +x "$SCRIPTS_DIR/create-b2c-app.sh"
chmod +x "$SCRIPTS_DIR/check-cosmos-free-tier.sh"
chmod +x "$SCRIPT_DIR/setup-b2c-policies.sh"

# Execute based on deploy or destroy flag
if [[ "$DESTROY" == "true" ]]; then
    destroy_resources
else
    deploy_resources
fi