#!/bin/bash
# validate-bicep.sh - Script to validate Arrow Tracker Bicep templates
# This script performs static validation of Bicep templates without deploying resources

# Set color variables for better readability
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Function to display help
function display_help() {
  echo "Usage: $0 [options]"
  echo ""
  echo "This script validates Bicep templates for the Arrow Tracker application."
  echo ""
  echo "Options:"
  echo "  -h, --help                 Display this help message"
  echo "  -t, --tenant-name NAME     B2C tenant name for parameter validation"
  echo "  -r, --resource-group NAME  Resource group name for what-if validation"
  echo ""
}

# Default values
B2C_TENANT_NAME="arrowtrackerb2ctest"
RESOURCE_GROUP="arrowtrack-test-rg"

# Parse arguments
while [[ $# -gt 0 ]]; do
  key="$1"
  case $key in
    -h|--help)
      display_help
      exit 0
      ;;
    -t|--tenant-name)
      B2C_TENANT_NAME="$2"
      shift
      shift
      ;;
    -r|--resource-group)
      RESOURCE_GROUP="$2"
      shift
      shift
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      display_help
      exit 1
      ;;
  esac
done

# Base directory for infrastructure code
INFRA_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BICEP_DIR="$INFRA_DIR/bicep"
MODULES_DIR="$BICEP_DIR/modules"

echo -e "${YELLOW}=== Arrow Tracker Bicep Template Validation ===${NC}"
echo "Infrastructure directory: $INFRA_DIR"

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

# Step 1: Validate main Bicep file
echo -e "${YELLOW}=== Validating main.bicep file ===${NC}"
if az bicep build --file "$BICEP_DIR/main.bicep"; then
  echo -e "${GREEN}✓ main.bicep syntax is valid${NC}"
else
  echo -e "${RED}✗ main.bicep has syntax errors${NC}"
  exit 1
fi

# Step 2: Validate individual modules
echo -e "${YELLOW}=== Validating Bicep modules ===${NC}"
for MODULE in "$MODULES_DIR"/*.bicep; do
  MODULE_NAME=$(basename "$MODULE")
  echo -e "${YELLOW}Validating module: $MODULE_NAME${NC}"
  
  if az bicep build --file "$MODULE"; then
    echo -e "${GREEN}✓ $MODULE_NAME syntax is valid${NC}"
  else
    echo -e "${RED}✗ $MODULE_NAME has syntax errors${NC}"
    exit 1
  fi
done

# Step 3: Test deployment with what-if operation
echo -e "${YELLOW}=== Testing deployment with what-if operation ===${NC}"
echo "Resource Group: $RESOURCE_GROUP"
echo "B2C Tenant Name: $B2C_TENANT_NAME"

# Ensure resource group exists for what-if validation
if ! az group show --name "$RESOURCE_GROUP" &>/dev/null; then
  echo -e "${YELLOW}Resource group does not exist. Creating resource group for validation...${NC}"
  az group create --name "$RESOURCE_GROUP" --location "westus2" --tags "purpose=testing" "environment=test"
fi

# What-if deployment to see changes without actual deployment
echo -e "${YELLOW}Performing what-if analysis of deployment...${NC}"
if az deployment group what-if \
  --resource-group "$RESOURCE_GROUP" \
  --template-file "$BICEP_DIR/main.bicep" \
  --parameters environmentName=test b2cTenantName="$B2C_TENANT_NAME"; then
  echo -e "${GREEN}✓ What-if deployment analysis completed successfully${NC}"
else
  echo -e "${RED}✗ What-if deployment analysis failed${NC}"
  exit 1
fi

echo -e "${GREEN}=== All Bicep templates validated successfully ===${NC}"
echo "You can now proceed with actual deployment using deploy.sh"