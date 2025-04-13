#!/bin/bash
# test-deployment.sh - Script to test Arrow Tracker infrastructure deployment
# This script deploys resources to a test environment and verifies they work correctly

# Set color variables for better readability
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Function to display help
function display_help() {
  echo "Usage: $0 [options]"
  echo ""
  echo "This script tests the deployment of Arrow Tracker infrastructure."
  echo ""
  echo "Options:"
  echo "  -h, --help                 Display this help message"
  echo "  -e, --environment NAME     Environment name (default: test)"
  echo "  -t, --tenant-name NAME     B2C tenant name (required)"
  echo "  -l, --location LOCATION    Azure region (default: westus2)"
  echo "  -c, --cleanup              Clean up resources after testing"
  echo ""
}

# Default values
ENVIRONMENT="test"
LOCATION="westus2"
CLEANUP=false
B2C_TENANT_NAME=""

# Parse arguments
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
    -t|--tenant-name)
      B2C_TENANT_NAME="$2"
      shift
      shift
      ;;
    -l|--location)
      LOCATION="$2"
      shift
      shift
      ;;
    -c|--cleanup)
      CLEANUP=true
      shift
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      display_help
      exit 1
      ;;
  esac
done

# Validate B2C tenant name
if [[ -z "$B2C_TENANT_NAME" ]]; then
  echo -e "${RED}Error: B2C tenant name (-t, --tenant-name) is required${NC}"
  display_help
  exit 1
fi

# Base directory for infrastructure code
INFRA_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BICEP_DIR="$INFRA_DIR/bicep"
RESOURCE_GROUP="arrowtrack-${ENVIRONMENT}-rg"

# List of alternate regions to try if the default region fails
# These regions typically have good availability for most SKUs
ALTERNATE_REGIONS=("eastus" "eastus2" "centralus" "northeurope" "westeurope")

echo -e "${YELLOW}=== Arrow Tracker Infrastructure Deployment Test ===${NC}"
echo "Infrastructure directory: $INFRA_DIR"
echo "Environment: $ENVIRONMENT"
echo "Resource Group: $RESOURCE_GROUP"
echo "Primary Location: $LOCATION"
echo "B2C Tenant Name: $B2C_TENANT_NAME"

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
  echo -e "${RED}Error: Azure CLI is not installed. Please install it first.${NC}"
  exit 1
fi

# Check if user is logged in to Azure
echo -e "${YELLOW}Checking Azure login status...${NC}"
if ! az account show &> /dev/null; then
  echo -e "${YELLOW}You are not logged in to Azure. Initiating login...${NC}"
  az login
else
  echo -e "${GREEN}Already logged in to Azure.${NC}"
fi

# First run validation to ensure templates are correct
echo -e "${YELLOW}Running Bicep validation before deployment...${NC}"
"$INFRA_DIR/tests/validate-bicep.sh" --tenant-name "$B2C_TENANT_NAME" --resource-group "$RESOURCE_GROUP"
if [ $? -ne 0 ]; then
  echo -e "${RED}Bicep validation failed. Aborting deployment test.${NC}"
  exit 1
fi

# Start deployment process
echo -e "${YELLOW}=== Starting test deployment ===${NC}"

# Create resource group
echo -e "${YELLOW}Creating resource group: $RESOURCE_GROUP in $LOCATION${NC}"
if az group create --name "$RESOURCE_GROUP" --location "$LOCATION" --tags "environment=$ENVIRONMENT" "application=arrow-tracker" "purpose=testing"; then
  echo -e "${GREEN}✓ Resource group created successfully${NC}"
else
  echo -e "${RED}✗ Failed to create resource group${NC}"
  exit 1
fi

# Deploy infrastructure using main.bicep
echo -e "${YELLOW}Deploying infrastructure with Bicep...${NC}"
DEPLOYMENT_NAME="arrowtrack-${ENVIRONMENT}-deployment-$(date +%Y%m%d%H%M%S)"

# Try deploying with the primary location first
echo -e "${YELLOW}Attempting deployment in primary location: $LOCATION${NC}"
DEPLOYMENT_SUCCESS=false

if az deployment group create \
  --name "$DEPLOYMENT_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --template-file "$BICEP_DIR/main.bicep" \
  --parameters environmentName="$ENVIRONMENT" location="$LOCATION" b2cTenantName="$B2C_TENANT_NAME"; then
  DEPLOYMENT_SUCCESS=true
  echo -e "${GREEN}✓ Deployment completed successfully in $LOCATION${NC}"
else
  echo -e "${YELLOW}Deployment in $LOCATION failed. Trying alternate regions...${NC}"
  
  # Try alternate regions if the primary location fails
  for alt_region in "${ALTERNATE_REGIONS[@]}"; do
    # Skip if it's the same as the primary location
    if [ "$alt_region" == "$LOCATION" ]; then
      continue
    fi
    
    echo -e "${YELLOW}Attempting deployment in alternate region: $alt_region${NC}"
    DEPLOYMENT_NAME="arrowtrack-${ENVIRONMENT}-deployment-$(date +%Y%m%d%H%M%S)"
    
    if az deployment group create \
      --name "$DEPLOYMENT_NAME" \
      --resource-group "$RESOURCE_GROUP" \
      --template-file "$BICEP_DIR/main.bicep" \
      --parameters environmentName="$ENVIRONMENT" location="$alt_region" b2cTenantName="$B2C_TENANT_NAME"; then
      DEPLOYMENT_SUCCESS=true
      LOCATION="$alt_region"  # Update the location for verification
      echo -e "${GREEN}✓ Deployment completed successfully in $alt_region${NC}"
      break
    else
      echo -e "${YELLOW}Deployment in $alt_region failed. Trying next region...${NC}"
    fi
  done
fi

# Check final deployment status
if [ "$DEPLOYMENT_SUCCESS" = true ]; then
  echo -e "${GREEN}✓ Deployment completed successfully in $LOCATION${NC}"
else
  echo -e "${RED}✗ Deployment failed in all attempted regions${NC}"
  
  if [ "$CLEANUP" = true ]; then
    echo -e "${YELLOW}Cleaning up failed deployment resources...${NC}"
    az group delete --name "$RESOURCE_GROUP" --yes --no-wait
    echo -e "${YELLOW}Resource group deletion initiated.${NC}"
  fi
  
  exit 1
fi

# Verify resource creation
echo -e "${YELLOW}=== Verifying deployed resources ===${NC}"

# Get deployment outputs
echo -e "${YELLOW}Retrieving deployment outputs...${NC}"
OUTPUTS=$(az deployment group show --resource-group "$RESOURCE_GROUP" --name "$DEPLOYMENT_NAME" --query "properties.outputs" -o json)

# Extract and verify key resources
FUNCTION_APP_NAME=$(echo $OUTPUTS | jq -r '.functionAppName.value')
STORAGE_ACCOUNT_NAME=$(echo $OUTPUTS | jq -r '.storageAccountName.value')
COSMOS_DB_NAME=$(echo $OUTPUTS | jq -r '.cosmosDbAccountName.value')
KEY_VAULT_NAME=$(echo $OUTPUTS | jq -r '.keyVaultName.value')
B2C_APP_ID=$(echo $OUTPUTS | jq -r '.b2cAppId.value')

echo "Function App: $FUNCTION_APP_NAME"
echo "Storage Account: $STORAGE_ACCOUNT_NAME"
echo "Cosmos DB: $COSMOS_DB_NAME"
echo "Key Vault: $KEY_VAULT_NAME"
echo "B2C App ID: $B2C_APP_ID"

# Check if Function App exists and is running
echo -e "${YELLOW}Verifying Function App...${NC}"
if az functionapp show --name "$FUNCTION_APP_NAME" --resource-group "$RESOURCE_GROUP" --query "state" -o tsv | grep -q "Running"; then
  echo -e "${GREEN}✓ Function App exists and is running${NC}"
else
  echo -e "${RED}✗ Function App verification failed${NC}"
  exit 1
fi

# Check if Storage Account exists
echo -e "${YELLOW}Verifying Storage Account...${NC}"
if az storage account show --name "$STORAGE_ACCOUNT_NAME" --resource-group "$RESOURCE_GROUP" --query "statusOfPrimary" -o tsv | grep -q "available"; then
  echo -e "${GREEN}✓ Storage Account exists and is available${NC}"
else
  echo -e "${RED}✗ Storage Account verification failed${NC}"
  exit 1
fi

# Check if Cosmos DB exists
echo -e "${YELLOW}Verifying Cosmos DB...${NC}"
if az cosmosdb show --name "$COSMOS_DB_NAME" --resource-group "$RESOURCE_GROUP" --query "documentEndpoint" -o tsv; then
  echo -e "${GREEN}✓ Cosmos DB exists and endpoint is available${NC}"
else
  echo -e "${RED}✗ Cosmos DB verification failed${NC}"
  exit 1
fi

# Check if Key Vault exists
echo -e "${YELLOW}Verifying Key Vault...${NC}"
if az keyvault show --name "$KEY_VAULT_NAME" --resource-group "$RESOURCE_GROUP" --query "properties.vaultUri" -o tsv; then
  echo -e "${GREEN}✓ Key Vault exists and URI is available${NC}"
else
  echo -e "${RED}✗ Key Vault verification failed${NC}"
  exit 1
fi

# Verify B2C application registration
echo -e "${YELLOW}Verifying B2C App registration...${NC}"
if [[ -n "$B2C_APP_ID" ]]; then
  echo -e "${GREEN}✓ B2C Application is registered with ID: $B2C_APP_ID${NC}"
else
  echo -e "${RED}✗ B2C Application verification failed${NC}"
  exit 1
fi

# Generate test configuration for B2C
echo -e "${YELLOW}Generating B2C configuration for testing...${NC}"
"$BICEP_DIR/setup-b2c-policies.sh" --tenant-name "$B2C_TENANT_NAME" --output "$INFRA_DIR/tests/b2c-test-config.json"

echo -e "${GREEN}=== Deployment test completed successfully ===${NC}"
echo "All resources have been deployed and verified."

# Clean up if requested
if [ "$CLEANUP" = true ]; then
  echo -e "${YELLOW}=== Cleaning up test resources ===${NC}"
  read -p "Are you sure you want to delete resource group $RESOURCE_GROUP? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Deleting resource group: $RESOURCE_GROUP${NC}"
    az group delete --name "$RESOURCE_GROUP" --yes
    echo -e "${GREEN}Resource group deleted.${NC}"
  else
    echo -e "${YELLOW}Resource cleanup canceled. Resources will be retained.${NC}"
  fi
else
  echo -e "${YELLOW}Resources have been kept for further testing.${NC}"
  echo "To clean up resources, run this script with the --cleanup option or use:"
  echo "az group delete --name $RESOURCE_GROUP --yes"
fi