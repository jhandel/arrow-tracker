#!/bin/bash
# setup-b2c-policies.sh - Script to set up basic B2C policies

# Set default values
TENANT_NAME=""
APP_ID=""

# Display help
function display_help() {
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  -h, --help                  Display this help message"
    echo "  -t, --tenant-name NAME      B2C tenant name without .onmicrosoft.com (required)"
    echo "  -a, --app-id ID             Application ID (required)"
    echo ""
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    key="$1"
    case $key in
        -h|--help)
            display_help
            exit 0
            ;;
        -t|--tenant-name)
            TENANT_NAME="$2"
            shift
            shift
            ;;
        -a|--app-id)
            APP_ID="$2"
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
if [[ -z "$TENANT_NAME" || -z "$APP_ID" ]]; then
    echo "Error: Missing required parameters"
    display_help
    exit 1
fi

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

# Sign in to the B2C tenant
echo "=> Signing in to B2C tenant: $TENANT_NAME.onmicrosoft.com"
az login --tenant "$TENANT_NAME.onmicrosoft.com" --allow-no-subscriptions

echo "=> Setting up basic B2C policies for tenant: $TENANT_NAME.onmicrosoft.com"
echo "=> This is a placeholder for policy setup. In a production environment, you would:"
echo "   1. Create custom policies for sign-up/sign-in workflows"
echo "   2. Configure identity providers (social, OIDC, SAML)"
echo "   3. Set up attribute collection, display controls, and MFA"
echo ""
echo "=> For development purposes, you can use the Azure portal to:"
echo "   1. Go to the Azure AD B2C tenant in the Azure portal"
echo "   2. Navigate to 'User flows (policies)'"
echo "   3. Create a 'Sign up and sign in' user flow"
echo "   4. Configure email sign-up/sign-in options"
echo "   5. Select attributes to collect and return"
echo ""
echo "=> For production deployment, consider scripting policy creation with:"
echo "   - Custom policy XML files"
echo "   - Microsoft Graph API calls"
echo "   - Azure CLI commands"

echo "=> Setup complete. Use the following information in your application:"
echo "   Tenant: $TENANT_NAME.onmicrosoft.com"
echo "   Authority: https://$TENANT_NAME.b2clogin.com/$TENANT_NAME.onmicrosoft.com"
echo "   Client ID: $APP_ID"
echo ""
echo "=> Recommended next steps:"
echo "   1. Create user flows in the Azure portal"
echo "   2. Configure your application to use these flows"
echo "   3. Test authentication with B2C endpoints"

exit 0