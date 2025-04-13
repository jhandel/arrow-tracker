// Azure AD B2C module for Arrow Tracker
@description('The name of the B2C tenant (without .onmicrosoft.com)')
param tenantName string

@description('The display name for the B2C application')
param applicationDisplayName string = 'Arrow Tracker'

@description('The reply URLs for the B2C application (where users will be redirected after authentication)')
param replyUrls array = [
  'http://localhost:3000'
  'https://localhost:3000'
]

@description('Tags to apply to B2C resources')
param tags object = {}

// Note: B2C tenant creation cannot be automated through Bicep
// This module will handle the app registration and policy configuration
// The tenant must be created manually in the Azure portal first

// B2C App Registration
resource b2cApp 'Microsoft.AzureActiveDirectory/b2cDirectories/applications@2023-01-01-preview' = {
  name: '${tenantName}/${applicationDisplayName}'
  properties: {
    displayName: applicationDisplayName
    identifierUris: [
      'https://${tenantName}.onmicrosoft.com/${applicationDisplayName}'
    ]
    replyUrls: replyUrls
    requiredResourceAccess: [
      {
        resourceAppId: '00000003-0000-0000-c000-000000000000' // Microsoft Graph
        resourceAccess: [
          {
            id: 'e1fe6dd8-ba31-4d61-89e7-88639da4683d' // User.Read
            type: 'Scope'
          }
        ]
      }
    ]
    webApp: {
      implicitGrantSettings: {
        enableAccessTokenIssuance: true
        enableIdTokenIssuance: true
      }
    }
    tags: tags.?applicationTags ?? []
  }
}

// Create service principal for the app
resource b2cAppServicePrincipal 'Microsoft.AzureActiveDirectory/b2cDirectories/applications/servicePrincipals@2023-01-01-preview' = {
  parent: b2cApp
  name: 'sp-${applicationDisplayName}'
  properties: {
    accountEnabled: true
    appId: b2cApp.properties.appId
    displayName: applicationDisplayName
    tags: tags.?servicePrincipalTags ?? []
  }
}

// Outputs
output appId string = b2cApp.properties.appId
output applicationName string = applicationDisplayName
output tenantName string = tenantName
output b2cTenantUrl string = 'https://${tenantName}.b2clogin.com/${tenantName}.onmicrosoft.com'
