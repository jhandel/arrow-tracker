// Storage Account module for Arrow Tracker
@description('The name of the storage account')
param name string

@description('The Azure region for the storage account')
param location string

@description('Tags to apply to the storage account')
param tags object

// Azure Storage Account resource
resource storageAccount 'Microsoft.Storage/storageAccounts@2022-09-01' = {
  name: name
  location: location
  tags: tags
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    supportsHttpsTrafficOnly: true
    encryption: {
      services: {
        blob: {
          enabled: true
        }
        file: {
          enabled: true
        }
        queue: {
          enabled: true
        }
        table: {
          enabled: true
        }
      }
      keySource: 'Microsoft.Storage'
    }
    accessTier: 'Hot'
    minimumTlsVersion: 'TLS1_2'
  }
}

// Blob Service for the storage account
resource blobService 'Microsoft.Storage/storageAccounts/blobServices@2022-09-01' = {
  parent: storageAccount
  name: 'default'
  properties: {
    deleteRetentionPolicy: {
      enabled: true
      days: 7
    }
    containerDeleteRetentionPolicy: {
      enabled: true
      days: 7
    }
  }
}

// Outputs
output id string = storageAccount.id
output name string = storageAccount.name
@description('Storage account key - note: this is sensitive data but @secure cannot be used with outputs')
output key string = storageAccount.listKeys().keys[0].value
