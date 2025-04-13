#!/bin/bash
# create-b2c-app.sh - Script to create Azure AD B2C application

# Set default values
TENANT_NAME=""
APP_DISPLAY_NAME=""
REPLY_URLS=""

# Display help
function display_help() {
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  -h, --help                  Display this help message"
    echo "  -t, --tenant-name NAME      B2C tenant name without .onmicrosoft.com (required)"
    echo "  -a, --app-name NAME         Application display name (required)"
    echo "  -r, --reply-urls URLS       Reply URLs as comma-separated list (required)"
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
        -a|--app-name)
            APP_DISPLAY_NAME="$2"
            shift
            shift
            ;;
        -r|--reply-urls)
            REPLY_URLS="$2"
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
if [[ -z "$TENANT_NAME" || -z "$APP_DISPLAY_NAME" || -z "$REPLY_URLS" ]]; then
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

# Convert comma-separated reply URLs to array
IFS=',' read -r -a REDIRECT_URIS_ARRAY <<< "$REPLY_URLS"

# Check if application already exists
echo "=> Checking if application '$APP_DISPLAY_NAME' already exists..."
EXISTING_APP=$(az ad app list --display-name "$APP_DISPLAY_NAME" --query "[0].appId" -o tsv)

if [[ -n "$EXISTING_APP" ]]; then
    echo "=> Application '$APP_DISPLAY_NAME' already exists with ID: $EXISTING_APP"
    
    # Update the existing application
    echo "=> Updating existing application..."
    
    # Create a comma-separated list of URIs for the update command
    REDIRECT_URIS_STRING=""
    for uri in "${REDIRECT_URIS_ARRAY[@]}"; do
        if [ -z "$REDIRECT_URIS_STRING" ]; then
            REDIRECT_URIS_STRING="$uri"
        else
            REDIRECT_URIS_STRING="$REDIRECT_URIS_STRING,$uri"
        fi
    done
    
    az ad app update --id "$EXISTING_APP" --web-redirect-uris "$REDIRECT_URIS_STRING"
    
    # Output the application ID
    echo "$EXISTING_APP"
    exit 0
fi

# Create the application using explicit parameters
echo "=> Creating application '$APP_DISPLAY_NAME'..."

# Create a comma-separated list of URIs for the create command
REDIRECT_URIS_STRING=""
for uri in "${REDIRECT_URIS_ARRAY[@]}"; do
    if [ -z "$REDIRECT_URIS_STRING" ]; then
        REDIRECT_URIS_STRING="'$uri'"
    else
        REDIRECT_URIS_STRING="$REDIRECT_URIS_STRING '$uri'"
    fi
done

# echo the application creation command for debugging
echo "az ad app create --display-name '$APP_DISPLAY_NAME' --sign-in-audience 'AzureADandPersonalMicrosoftAccount' --enable-id-token-issuance true --web-redirect-uris $REDIRECT_URIS_STRING"

APP_ID=$(az ad app create \
    --display-name "$APP_DISPLAY_NAME" \
    --sign-in-audience "AzureADandPersonalMicrosoftAccount" \
    --enable-id-token-issuance true \
    --query "appId" \
    -o tsv \    
    --web-redirect-uris $REDIRECT_URIS_STRING)

if [[ $? -ne 0 || -z "$APP_ID" ]]; then
    echo "Error: Failed to create application."
    exit 1
fi

echo "=> Application created with ID: $APP_ID"

# Create service principal for the application
echo "=> Creating service principal for application..."
az ad sp create --id "$APP_ID"

echo "$APP_ID"
exit 0