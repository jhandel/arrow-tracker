// Key Vault module for Arrow Tracker
@description('The name of the Key Vault')
param name string

@description('The Azure region for the Key Vault')
param location string

@description('Tags to apply to the Key Vault')
param tags object

@description('The principal ID of the function app that will access Key Vault (optional)')
param functionAppPrincipalId string = ''

// Modify the key vault name generation to ensure it's within limits
param keyVaultName string = 'kv-${uniqueString(resourceGroup().id)}'

// Update to ensure the name stays under 24 characters
var shortVaultName = length(keyVaultName) > 24 ? substring(keyVaultName, 0, 24) : keyVaultName

// Key Vault resource
resource keyVault 'Microsoft.KeyVault/vaults@2023-02-01' = {
  name: name
  location: location
  tags: tags
  properties: {
    sku: {
      family: 'A'
      name: 'standard'
    }
    tenantId: subscription().tenantId
    enabledForDeployment: false
    enabledForDiskEncryption: false
    enabledForTemplateDeployment: true
    enableRbacAuthorization: true
    softDeleteRetentionInDays: 7
  }
}

// Role assignment for Function App to access secrets (only created if principalId is provided)
resource keyVaultSecretsUserRole 'Microsoft.Authorization/roleDefinitions@2022-04-01' existing = if (!empty(functionAppPrincipalId)) {
  scope: subscription()
  name: '4633458b-17de-408a-b874-0445c86b69e6' // Key Vault Secrets User role
}

resource functionAppKeyVaultSecretsUserRoleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = if (!empty(functionAppPrincipalId)) {
  scope: keyVault
  name: guid(keyVault.id, functionAppPrincipalId, keyVaultSecretsUserRole.id)
  properties: {
    roleDefinitionId: keyVaultSecretsUserRole.id
    principalId: functionAppPrincipalId
    principalType: 'ServicePrincipal'
  }
}

// Outputs
output id string = keyVault.id
output name string = keyVault.name
output uri string = keyVault.properties.vaultUri
