// Cosmos DB module for Arrow Tracker
@description('The name of the Cosmos DB account')
param name string

@description('The Azure region for the Cosmos DB account')
param location string

@description('Tags to apply to the Cosmos DB account')
param tags object

@description('Whether to use free tier for this Cosmos DB account (limit: one per subscription)')
param enableFreeTier bool = true

// Cosmos DB Account resource
resource cosmosDbAccount 'Microsoft.DocumentDB/databaseAccounts@2023-04-15' = {
  name: name
  location: location
  tags: tags
  kind: 'GlobalDocumentDB'
  properties: {
    enableFreeTier: enableFreeTier
    databaseAccountOfferType: 'Standard'
    consistencyPolicy: {
      defaultConsistencyLevel: 'Session'
    }
    locations: [
      {
        locationName: location
        failoverPriority: 0
        isZoneRedundant: false
      }
    ]
    capabilities: [
      {
        name: 'EnableServerless'
      }
    ]
  }
}

// Database
resource database 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases@2023-04-15' = {
  parent: cosmosDbAccount
  name: 'ArrowTrackerDB'
  properties: {
    resource: {
      id: 'ArrowTrackerDB'
    }
  }
}

// Containers
resource usersContainer 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2023-04-15' = {
  parent: database
  name: 'Users'
  properties: {
    resource: {
      id: 'Users'
      partitionKey: {
        paths: [
          '/userId'
        ]
        kind: 'Hash'
      }
      indexingPolicy: {
        indexingMode: 'consistent'
        includedPaths: [
          {
            path: '/*'
          }
        ]
      }
    }
  }
}

resource practiceSessionsContainer 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2023-04-15' = {
  parent: database
  name: 'PracticeSessions'
  properties: {
    resource: {
      id: 'PracticeSessions'
      partitionKey: {
        paths: [
          '/userId'
        ]
        kind: 'Hash'
      }
      indexingPolicy: {
        indexingMode: 'consistent'
        includedPaths: [
          {
            path: '/*'
          }
        ]
      }
    }
  }
}

resource equipmentContainer 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2023-04-15' = {
  parent: database
  name: 'Equipment'
  properties: {
    resource: {
      id: 'Equipment'
      partitionKey: {
        paths: [
          '/userId'
        ]
        kind: 'Hash'
      }
      indexingPolicy: {
        indexingMode: 'consistent'
        includedPaths: [
          {
            path: '/*'
          }
        ]
      }
    }
  }
}

// Outputs
output id string = cosmosDbAccount.id
output name string = cosmosDbAccount.name
@description('Cosmos DB connection string - note: this is sensitive data but @secure cannot be used with outputs')
output connectionString string = cosmosDbAccount.listConnectionStrings().connectionStrings[0].connectionString
output databaseName string = database.name
