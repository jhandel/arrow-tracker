# Arrow Tracker Azure Infrastructure

This directory contains Infrastructure as Code (IaC) files for deploying the Arrow Tracker application's Azure backend services. The infrastructure is designed to be ephemeral - easy to create and tear down during development.

## Architecture

The Azure infrastructure includes the following resources:

- **Resource Group**: Contains all Azure resources for the Arrow Tracker application
- **Azure AD B2C**: Authentication service for the application
- **Azure Functions**: Serverless backend API endpoints
- **Cosmos DB**: NoSQL database for storing user and application data
- **Storage Account**: Storage for files, blobs, and Function App code
- **App Service Plan**: Consumption plan for hosting Azure Functions
- **Key Vault**: Secure storage for application secrets and configuration

## Prerequisites

- [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli) installed
- Azure subscription
- Azure AD B2C tenant (must be created manually)

## B2C Tenant Setup

Before deploying the infrastructure, you need to create an Azure AD B2C tenant:

1. Sign in to the [Azure portal](https://portal.azure.com)
2. Create a new Azure AD B2C tenant by following [the official documentation](https://docs.microsoft.com/en-us/azure/active-directory-b2c/tutorial-create-tenant)
3. Note the tenant name (e.g., `arrowtrackerb2c`), which you'll need for deployment

## Deployment

To deploy the infrastructure:

```bash
cd infra/bicep
./deploy.sh --tenant-name <your-b2c-tenant-name>
```

Additional options:

```bash
# Deploy to a specific Azure region
./deploy.sh --tenant-name <your-b2c-tenant-name> --location eastus2

# Specify a custom environment name (affects resource naming)
./deploy.sh --tenant-name <your-b2c-tenant-name> --environment staging

# Specify a custom resource group name
./deploy.sh --tenant-name <your-b2c-tenant-name> --resource-group my-custom-rg
```

## Post-Deployment Configuration

After deployment, you need to:

1. Configure user flows in the B2C tenant:
   - Sign-up and sign-in
   - Profile editing
   - Password reset

2. Update the client application with the B2C configuration:
   - Update the B2C client ID in `.env` file
   - Update the B2C tenant name in `.env` file
   - Configure the correct policy names in the authentication configuration

## Tearing Down the Environment

To tear down all Azure resources:

```bash
cd infra/bicep
./deploy.sh --destroy
```

This will remove all resources in the resource group, but will not delete the B2C tenant. To delete the B2C tenant, you must do so manually in the Azure portal.

## Notes

- The B2C directory module requires the B2C tenant to be created manually before deployment
- All resources are tagged with environment and application tags for easy identification
- Key Vault is used to store all sensitive information
- The infrastructure uses managed identities where possible for secure authentication
- The environment is configured for development and is not suitable for production use without modifications