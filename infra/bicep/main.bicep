// main.bicep
// Main deployment file for Arrow Tracker development environment

// Parameters
@description('The environment name. Default: dev')
param environmentName string = 'dev'

@description('The Azure region for deploying resources')
param location string = resourceGroup().location

@description('Tags to apply to all resources')
param tags object = {
  environment: environmentName
  application: 'arrow-tracker'
  provisioner: 'bicep'
}

@description('Unique suffix for resource names')
param uniqueSuffix string = uniqueString(resourceGroup().id)

@description('B2C tenant name (without .onmicrosoft.com)')
param b2cTenantName string

@description('B2C application ID')
param b2cAppId string = ''

@description('Whether to enable free tier for Cosmos DB (one per subscription)')
param cosmosDbFreeTier bool = true

@description('Override for the function app name. If not provided, a generated name will be used.')
param functionAppName string = ''

// Variables
var baseName = 'arrowtrack-${environmentName}'
// Use provided function app name or generate one with unique suffix
var actualFunctionAppName = !empty(functionAppName) ? functionAppName : take('${baseName}-func-${uniqueSuffix}', 24)
// Ensure app service plan name length <= 24 chars
var appServicePlanName = take('${baseName}-plan-${uniqueSuffix}', 24)
// Fix storage account name length - truncate the base name and make sure total length <= 24 chars
var storagePrefix = take(replace('arrowtrack${environmentName}', '-', ''), 14)
var storageAccountName = '${storagePrefix}st${take(uniqueSuffix, 8)}'
// Ensure Cosmos DB account name length <= 24 chars
var cosmosDbAccountName = take('${baseName}-cosmos-${uniqueSuffix}', 24)
// Ensure Key Vault name length <= 24 chars
var keyVaultName = take('${baseName}-kv-${uniqueSuffix}', 24)
// B2C tenant URL
var b2cTenantUrl = 'https://${b2cTenantName}.b2clogin.com/${b2cTenantName}.onmicrosoft.com'

// Resource definitions
// Storage Account
module storageAccount 'modules/storageAccount.bicep' = {
  name: 'storageAccountDeployment'
  params: {
    name: storageAccountName
    location: location
    tags: tags
  }
}

// App Service Plan
module appServicePlan 'modules/appServicePlan.bicep' = {
  name: 'appServicePlanDeployment'
  params: {
    name: appServicePlanName
    location: location
    tags: tags
  }
}

// Key Vault (without Function App permissions initially)
module keyVault 'modules/keyVault.bicep' = {
  name: 'keyVaultDeployment'
  params: {
    name: keyVaultName
    location: location
    tags: tags
    // No functionAppPrincipalId here to break circular dependency
  }
}

// Function App
module functionApp 'modules/functionApp.bicep' = {
  name: 'functionAppDeployment'
  params: {
    name: actualFunctionAppName
    location: location
    tags: tags
    appServicePlanId: appServicePlan.outputs.id
    storageAccountName: storageAccount.outputs.name
    storageAccountKey: storageAccount.outputs.key
    keyVaultName: keyVault.outputs.name
  }
}

// Update Key Vault with Function App permissions
module keyVaultUpdate 'modules/keyVault.bicep' = {
  name: 'keyVaultUpdateDeployment'
  params: {
    name: keyVaultName
    location: location
    tags: tags
    functionAppPrincipalId: functionApp.outputs.principalId
  }
}

// Cosmos DB Account
module cosmosDb 'modules/cosmosDb.bicep' = {
  name: 'cosmosDbDeployment'
  params: {
    name: cosmosDbAccountName
    location: location
    tags: tags
    enableFreeTier: cosmosDbFreeTier
  }
}

// Store B2C configuration in Key Vault - using variables to ensure names are calculated at start of deployment
var b2cClientIdSecretName = '${keyVaultName}/B2C-CLIENT-ID'
var b2cTenantSecretName = '${keyVaultName}/B2C-TENANT-NAME'
var b2cTenantUrlSecretName = '${keyVaultName}/B2C-TENANT-URL'

resource b2cClientIdSecret 'Microsoft.KeyVault/vaults/secrets@2023-02-01' = {
  name: b2cClientIdSecretName
  properties: {
    value: b2cAppId
  }
  dependsOn: [
    keyVaultUpdate
  ]
}

resource b2cTenantSecret 'Microsoft.KeyVault/vaults/secrets@2023-02-01' = {
  name: b2cTenantSecretName
  properties: {
    value: b2cTenantName
  }
  dependsOn: [
    keyVaultUpdate
  ]
}

resource b2cTenantUrlSecret 'Microsoft.KeyVault/vaults/secrets@2023-02-01' = {
  name: b2cTenantUrlSecretName
  properties: {
    value: b2cTenantUrl
  }
  dependsOn: [
    keyVaultUpdate
  ]
}

// Outputs
output resourceGroupName string = resourceGroup().name
output functionAppName string = functionApp.outputs.name
output functionAppUrl string = functionApp.outputs.url
output storageAccountName string = storageAccount.outputs.name
output cosmosDbAccountName string = cosmosDb.outputs.name
output keyVaultName string = keyVault.outputs.name
output b2cTenantName string = b2cTenantName
output b2cTenantUrl string = b2cTenantUrl
output b2cAppId string = b2cAppId
