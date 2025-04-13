---
layout: default
---
# Action Plan: Azure Development Environment Setup with B2C Authentication

## Overview
This action plan outlines the steps required to set up an initial Azure development environment with Azure AD B2C authentication for the Arrow Tracker application. The environment will be designed to be ephemeral and easy to tear down when development is complete.

## Status
- [x] Planning
- [x] In Progress
- [x] Completed

## Checklist
- [x] Set up the base Azure infrastructure
  - [x] Create resource group for development environment
  - [x] Define naming conventions for Azure resources
  - [x] Create Bicep templates for infrastructure deployment
- [x] Set up Azure AD B2C tenant
  - [x] Create Bicep template for B2C application registration
  - [x] Configure user flows (sign-up, sign-in, profile editing)
  - [x] Create helper script for B2C policy configuration
  - [x] Create template for client-side B2C configuration
- [x] Integrate B2C with backend services
  - [x] Set up Azure Functions app structure
  - [x] Configure Functions app to use B2C for authentication
  - [x] Create middleware for token validation
  - [x] Create protected and public API endpoints
- [x] Create client application configuration
  - [x] Update MSAL configuration with B2C endpoints
  - [x] Configure API endpoints and auth scopes
  - [x] Test authentication flow end-to-end
- [x] Set up infrastructure deployment process
  - [x] Create deploy.sh script for easy deployment
  - [x] Create README with deployment instructions
  - [x] Add environment variables template
- [x] Document environment setup and tear-down process
  - [x] Create documentation for local development setup
  - [x] Document tear-down procedure for cleaning up resources

## Notes
- All resources will be created in a single resource group for easy management and deletion
- Development-specific naming convention will be used to distinguish from production resources
- We've implemented Azure Bicep for Infrastructure as Code to ensure consistent deployment and easy tear-down
- Local development settings will be stored in .env files (added to .gitignore)
- B2C tenant creation cannot be fully automated with Bicep and requires some manual setup in the Azure portal
- The Azure Function app includes both public and protected endpoints to demonstrate B2C authentication
- MSAL.js is configured in the client application to integrate with Azure AD B2C authentication

## Outcomes
We have successfully implemented a comprehensive Infrastructure as Code (IaC) solution for an ephemeral Azure development environment with B2C authentication. The key outcomes include:

1. **Modular Azure Infrastructure**:
   - Created reusable Bicep modules for core Azure resources: Storage Account, App Service Plan, Function App, Cosmos DB, Key Vault, and B2C
   - Implemented proper resource naming conventions and tagging for easy identification
   - Configured managed identities for secure authentication between components

2. **Authentication System**:
   - Set up B2C tenant configuration and application registration
   - Created authentication middleware for validating B2C tokens in Azure Functions
   - Configured MSAL.js in the React client for seamless B2C integration
   - Implemented both protected and public API endpoints for testing

3. **Developer Experience**:
   - Created scripts for easy deployment (`deploy.sh`) and B2C configuration (`setup-b2c-policies.sh`)
   - Set up environment variable templates for local development
   - Documented the complete setup and teardown process

4. **Client-Server Integration**:
   - Connected the React client to the Azure Functions API via authenticated endpoints
   - Configured proper CORS settings for local development
   - Set up Redux store integration with authentication state

This implementation provides a solid foundation for the Arrow Tracker application development with a secure, scalable, and maintainable Azure backend. The environment is designed to be ephemeral, making it easy to create for development and tear down when no longer needed, while following Azure best practices throughout.