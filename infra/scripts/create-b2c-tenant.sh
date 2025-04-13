#!/bin/bash
# create-b2c-tenant.sh - Script to create Azure AD B2C tenant

# Set default values
DISPLAY_NAME=""
TENANT_NAME=""
RESOURCE_GROUP=""
LOCATION=""
SKU="PremiumP1"
COUNTRY_CODE="US"

# Display help
function display_help() {
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  -h, --help                 Display this help message"
    echo "  -d, --display-name NAME    Display name for the B2C tenant (required)"
    echo "  -t, --tenant-name NAME     Tenant name without .onmicrosoft.com (required)"
    echo "  -g, --resource-group NAME  Resource group name (required)"
    echo "  -l, --location LOCATION    Azure region (required, will be mapped to valid B2C region)"
    echo "  -s, --sku NAME             SKU name (default: PremiumP1)"
    echo "  -c, --country-code CODE    Country code (default: US)"
    echo ""
    echo "Note: Valid B2C regions are 'global', 'unitedstates', 'europe', 'asiapacific', 'australia', 'japan'"
    echo ""
}

# Map Azure region to valid B2C region
function map_to_b2c_region() {
    local region=$1
    local b2c_region

    # US regions map to unitedstates
    if [[ $region == *"us"* ]]; then
        b2c_region="United States"
    # European regions map to europe
    elif [[ $region == *"eu"* || $region == *"uk"* || $region == "northeurope" || $region == "westeurope" ]]; then
        b2c_region="europe"
    # Asia Pacific regions map to asiapacific
    elif [[ $region == *"asia"* || $region == *"india"* || $region == *"korea"* ]]; then
        b2c_region="asiapacific"
    # Australia regions map to australia
    elif [[ $region == *"australia"* ]]; then
        b2c_region="australia"
    # Japan regions map to japan
    elif [[ $region == *"japan"* ]]; then
        b2c_region="japan"
    # Default to global
    else
        b2c_region="global"
    fi

    echo $b2c_region
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    key="$1"
    case $key in
        -h|--help)
            display_help
            exit 0
            ;;
        -d|--display-name)
            DISPLAY_NAME="$2"
            shift
            shift
            ;;
        -t|--tenant-name)
            TENANT_NAME="$2"
            shift
            shift
            ;;
        -g|--resource-group)
            RESOURCE_GROUP="$2"
            shift
            shift
            ;;
        -l|--location)
            LOCATION="$2"
            shift
            shift
            ;;
        -s|--sku)
            SKU="$2"
            shift
            shift
            ;;
        -c|--country-code)
            COUNTRY_CODE="$2"
            shift
            shift
            ;;
        *)
            echo "Unknown option: $1"
            display_help
            exit 1
            ;;
    esac
done

# Validate required parameters
if [[ -z "$DISPLAY_NAME" || -z "$TENANT_NAME" || -z "$RESOURCE_GROUP" || -z "$LOCATION" ]]; then
    echo "Error: Missing required parameters"
    display_help
    exit 1
fi

# Map the provided location to a valid B2C location
B2C_LOCATION=$(map_to_b2c_region "$LOCATION")
echo "=> Mapping Azure region '$LOCATION' to B2C region '$B2C_LOCATION'"

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

# Using ARM resource approach for B2C tenant creation
echo "=> Checking if B2C tenant '$TENANT_NAME.onmicrosoft.com' already exists..."
EXISTING_TENANT=$(az resource list --resource-type "Microsoft.AzureActiveDirectory/b2cDirectories" --query "[?name=='$TENANT_NAME.onmicrosoft.com'].id" -o tsv)

if [[ -n "$EXISTING_TENANT" ]]; then
    echo "=> B2C tenant '$TENANT_NAME.onmicrosoft.com' already exists with ID: $EXISTING_TENANT"
    TENANT_ID=$(echo $EXISTING_TENANT | awk -F'/' '{print $NF}')
    echo "$TENANT_ID"
    exit 0
fi

# Create the B2C tenant using ARM template
echo "=> Creating B2C tenant '$DISPLAY_NAME' ($TENANT_NAME.onmicrosoft.com)..."

# Create ARM template for B2C tenant
cat > b2c-tenant-template.json << EOF
{
    "\$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
    "contentVersion": "1.0.0.0",
    "parameters": {},
    "resources": [
        {
            "type": "Microsoft.AzureActiveDirectory/b2cDirectories",
            "apiVersion": "2021-04-01",
            "name": "$TENANT_NAME.onmicrosoft.com",
            "location": "$B2C_LOCATION",
            "sku": {
                "name": "$SKU",
                "tier": "A0"
            },
            "properties": {
                "createTenantProperties": {
                    "displayName": "$DISPLAY_NAME",
                    "countryCode": "$COUNTRY_CODE"
                }
            }
        }
    ]
}
EOF

# Deploy the ARM template
DEPLOYMENT_NAME="b2c-tenant-deployment-$(date +%s)"
DEPLOYMENT_OUTPUT=$(az deployment group create \
    --resource-group "$RESOURCE_GROUP" \
    --name "$DEPLOYMENT_NAME" \
    --template-file b2c-tenant-template.json \
    --query "properties.outputs" \
    -o json)

if [[ $? -ne 0 ]]; then
    echo "Error: Failed to create B2C tenant."
    rm -f b2c-tenant-template.json
    exit 1
fi

echo "=> B2C tenant creation initiated. This can take up to 10 minutes to complete."

# Get the tenant ID from the deployment output or by querying resources
TENANT_RESOURCE=$(az resource list --resource-type "Microsoft.AzureActiveDirectory/b2cDirectories" --query "[?name=='$TENANT_NAME.onmicrosoft.com'].id" -o tsv)
if [[ -n "$TENANT_RESOURCE" ]]; then
    TENANT_ID=$(echo $TENANT_RESOURCE | awk -F'/' '{print $NF}')
    echo "=> Tenant domain: $TENANT_NAME.onmicrosoft.com"
    echo "=> Tenant ID: $TENANT_ID"
    echo "$TENANT_ID"
else
    echo "Error: Failed to retrieve tenant ID. Please check the Azure Portal."
    exit 1
fi

# Clean up template file
rm -f b2c-tenant-template.json

exit 0