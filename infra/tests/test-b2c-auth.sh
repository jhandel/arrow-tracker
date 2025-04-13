#!/bin/bash
# test-b2c-auth.sh - Script to test B2C authentication integration
# This script tests the B2C authentication flow between client and API

# Set color variables for better readability
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Function to display help
function display_help() {
  echo "Usage: $0 [options]"
  echo ""
  echo "This script tests B2C authentication integration for the Arrow Tracker application."
  echo ""
  echo "Options:"
  echo "  -h, --help                 Display this help message"
  echo "  -e, --environment NAME     Environment name (default: test)"
  echo "  -t, --tenant-name NAME     B2C tenant name (required)"
  echo "  -c, --config-file FILE     B2C configuration file (default: b2c-test-config.json)"
  echo ""
}

# Default values
ENVIRONMENT="test"
B2C_TENANT_NAME=""
CONFIG_FILE="b2c-test-config.json"

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
    -c|--config-file)
      CONFIG_FILE="$2"
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

# Validate B2C tenant name
if [[ -z "$B2C_TENANT_NAME" ]]; then
  echo -e "${RED}Error: B2C tenant name (-t, --tenant-name) is required${NC}"
  display_help
  exit 1
fi

# Base directory for infrastructure code
INFRA_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONFIG_PATH="$INFRA_DIR/tests/$CONFIG_FILE"
RESOURCE_GROUP="arrowtrack-${ENVIRONMENT}-rg"

echo -e "${YELLOW}=== Arrow Tracker B2C Authentication Test ===${NC}"
echo "Infrastructure directory: $INFRA_DIR"
echo "Environment: $ENVIRONMENT"
echo "Resource Group: $RESOURCE_GROUP"
echo "B2C Tenant Name: $B2C_TENANT_NAME"
echo "Config File: $CONFIG_PATH"

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

# Check if B2C config file exists or generate it
if [[ ! -f "$CONFIG_PATH" ]]; then
  echo -e "${YELLOW}B2C config file not found. Generating new configuration...${NC}"
  "$INFRA_DIR/bicep/setup-b2c-policies.sh" --tenant-name "$B2C_TENANT_NAME" --output "$CONFIG_PATH"
  if [[ ! -f "$CONFIG_PATH" ]]; then
    echo -e "${RED}Failed to generate B2C configuration file.${NC}"
    exit 1
  fi
fi

# Load B2C configuration
echo -e "${YELLOW}Loading B2C configuration from $CONFIG_PATH...${NC}"
if ! command -v jq &> /dev/null; then
  echo -e "${RED}Error: jq is not installed. Please install it first.${NC}"
  exit 1
fi

B2C_CLIENT_ID=$(jq -r '.clientId' "$CONFIG_PATH")
B2C_AUTHORITY=$(jq -r '.authority' "$CONFIG_PATH")
B2C_SIGN_UP_SIGN_IN_POLICY=$(jq -r '.policies.signUpSignIn' "$CONFIG_PATH")
B2C_REDIRECT_URI=$(jq -r '.redirectUri' "$CONFIG_PATH")

echo "B2C Client ID: $B2C_CLIENT_ID"
echo "B2C Authority: $B2C_AUTHORITY"
echo "B2C Sign-Up/Sign-In Policy: $B2C_SIGN_UP_SIGN_IN_POLICY"
echo "B2C Redirect URI: $B2C_REDIRECT_URI"

# Get Function App information
echo -e "${YELLOW}Retrieving Function App information...${NC}"
FUNCTION_APP_NAME=$(az functionapp list --resource-group "$RESOURCE_GROUP" --query "[0].name" -o tsv)
if [[ -z "$FUNCTION_APP_NAME" ]]; then
  echo -e "${RED}Error: Function App not found in resource group $RESOURCE_GROUP${NC}"
  exit 1
fi

FUNCTION_APP_URL=$(az functionapp show --name "$FUNCTION_APP_NAME" --resource-group "$RESOURCE_GROUP" --query "defaultHostName" -o tsv)
echo "Function App: $FUNCTION_APP_NAME"
echo "Function App URL: $FUNCTION_APP_URL"

# Test the health endpoint (public endpoint that doesn't require authentication)
echo -e "${YELLOW}=== Testing public health endpoint ===${NC}"
HEALTH_ENDPOINT="https://$FUNCTION_APP_URL/api/health"
echo "Testing endpoint: $HEALTH_ENDPOINT"

HEALTH_RESPONSE=$(curl -s "$HEALTH_ENDPOINT")
if [[ $HEALTH_RESPONSE == *"healthy"* ]]; then
  echo -e "${GREEN}✓ Health endpoint is accessible and responding correctly${NC}"
else
  echo -e "${RED}✗ Health endpoint test failed${NC}"
  echo "Response: $HEALTH_RESPONSE"
  exit 1
fi

# Test the user profile endpoint (protected endpoint that requires authentication)
echo -e "${YELLOW}=== Testing B2C authentication prerequisites ===${NC}"

# Check if B2C tenant and policies are configured
echo -e "${YELLOW}Checking B2C tenant configuration...${NC}"
B2C_TENANT_CHECK=$(az ad app show --id "$B2C_CLIENT_ID" 2>/dev/null)
if [[ -z "$B2C_TENANT_CHECK" ]]; then
  echo -e "${RED}✗ B2C application with ID $B2C_CLIENT_ID not found${NC}"
  echo "You need to manually create the B2C tenant and configure the policies in the Azure portal."
  echo "After configuring, please run the tests again."
  exit 1
else
  echo -e "${GREEN}✓ B2C application is configured correctly${NC}"
fi

echo -e "${YELLOW}=== Testing protected endpoints ===${NC}"
echo "To fully test B2C authentication, you need to run the client application locally with the proper B2C configuration."
echo "Since B2C authentication requires user interaction in a browser, we can't fully automate this test."
echo ""
echo "To complete the testing, follow these steps:"

echo -e "${YELLOW}1. Update the client environment variables:${NC}"
echo "   Copy the following configuration to client/arrow-tracker/.env.local:"
cat <<EOF
REACT_APP_B2C_TENANT_NAME=$B2C_TENANT_NAME
REACT_APP_B2C_CLIENT_ID=$B2C_CLIENT_ID
REACT_APP_B2C_SIGN_UP_SIGN_IN_POLICY=$B2C_SIGN_UP_SIGN_IN_POLICY
REACT_APP_B2C_RESET_PASSWORD_POLICY=B2C_1_passwordreset
REACT_APP_B2C_EDIT_PROFILE_POLICY=B2C_1_profileedit
REACT_APP_API_BASE_URL=https://$FUNCTION_APP_URL
EOF

echo -e "${YELLOW}2. Update the Azure Functions app local settings:${NC}"
echo "   Copy the following configuration to api/local.settings.json:"
cat <<EOF
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "NODE_ENV": "development",
    "B2C_TENANT_NAME": "$B2C_TENANT_NAME",
    "B2C_CLIENT_ID": "$B2C_CLIENT_ID",
    "B2C_SIGN_UP_SIGN_IN_POLICY": "$B2C_SIGN_UP_SIGN_IN_POLICY"
  },
  "Host": {
    "CORS": "http://localhost:3000,https://localhost:3000",
    "CORSCredentials": true
  }
}
EOF

echo -e "${YELLOW}3. Run the client application:${NC}"
echo "   cd client/arrow-tracker"
echo "   npm start"

echo -e "${YELLOW}4. Test the authentication flow:${NC}"
echo "   - Click 'Sign In' to test the B2C login flow"
echo "   - After signing in, the app should fetch the user profile from the protected API endpoint"

echo -e "${YELLOW}=== B2C Authentication Test Summary ===${NC}"
echo "✓ Health endpoint is accessible and responding correctly"
echo "✓ B2C application is configured correctly"
echo "? Protected endpoint testing requires manual steps (see instructions above)"
echo ""
echo "The test is partially completed. Manual steps are required to test the full authentication flow."