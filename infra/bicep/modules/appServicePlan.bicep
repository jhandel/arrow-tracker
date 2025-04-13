// App Service Plan module for Arrow Tracker
@description('The name of the App Service Plan')
param name string

@description('The Azure region for the App Service Plan')
param location string

@description('Tags to apply to the App Service Plan')
param tags object

// App Service Plan resource
resource appServicePlan 'Microsoft.Web/serverfarms@2022-03-01' = {
  name: name
  location: location
  tags: tags
  sku: {
    name: 'B1' // Changed from Y1 to B1 (Basic tier) which has better availability
    tier: 'Basic'
  }
  properties: {
    reserved: true // Required for Linux
  }
}

// Outputs
output id string = appServicePlan.id
output name string = appServicePlan.name
