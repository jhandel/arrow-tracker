// Function App module for Arrow Tracker
@description('The name of the Function App')
param name string

@description('The Azure region for the Function App')
param location string

@description('Tags to apply to the Function App')
param tags object

@description('The ID of the App Service Plan to use')
param appServicePlanId string

@description('The name of the Storage Account to use')
param storageAccountName string

@description('The key for the Storage Account')
@secure()
param storageAccountKey string

@description('The name of the Key Vault to use for secrets (optional)')
param keyVaultName string = ''

// Function App resource
resource functionApp 'Microsoft.Web/sites@2022-03-01' = {
  name: name
  location: location
  tags: tags
  kind: 'functionapp,linux'
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    serverFarmId: appServicePlanId
    siteConfig: {
      linuxFxVersion: 'Node|18'
      ftpsState: 'Disabled'
      minTlsVersion: '1.2'
      http20Enabled: true
      appSettings: concat([
          {
            name: 'AzureWebJobsStorage'
            value: 'DefaultEndpointsProtocol=https;AccountName=${storageAccountName};AccountKey=${storageAccountKey};EndpointSuffix=${environment().suffixes.storage}'
          }
          {
            name: 'FUNCTIONS_EXTENSION_VERSION'
            value: '~4'
          }
          {
            name: 'FUNCTIONS_WORKER_RUNTIME'
            value: 'node'
          }
          {
            name: 'WEBSITE_NODE_DEFAULT_VERSION'
            value: '~18'
          }
          {
            name: 'WEBSITE_CONTENTAZUREFILECONNECTIONSTRING'
            value: 'DefaultEndpointsProtocol=https;AccountName=${storageAccountName};AccountKey=${storageAccountKey};EndpointSuffix=${environment().suffixes.storage}'
          }
          {
            name: 'WEBSITE_CONTENTSHARE'
            value: toLower(name)
          }
          {
            name: 'NODE_ENV'
            value: 'development'
          }
        ], !empty(keyVaultName) ? [
          {
            name: 'KEY_VAULT_URI'
            value: 'https://${keyVaultName}${environment().suffixes.keyvaultDns}'
          }
        ] : [])
      cors: {
        allowedOrigins: [
          'http://localhost:3000'
          'https://localhost:3000'
        ]
        supportCredentials: true
      }
    }
    httpsOnly: true
  }
}

// Outputs
output id string = functionApp.id
output name string = functionApp.name
output url string = 'https://${functionApp.properties.defaultHostName}'
output principalId string = functionApp.identity.principalId
