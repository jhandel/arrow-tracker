# Copilot Instructions for Arrow Tracker Development

These instructions guide GitHub Copilot when assisting with the Arrow Tracker application development.

## Azure Specific Rules

- @azure Rule - Use Azure Best Practices: When generating code for Azure, running terminal commands for Azure, or performing operations related to Azure, invoke your `azure_development-get_best_practices` tool if available.

## Architecture-Specific Guidelines

### Progressive Web App (Frontend)
- Prioritize offline-first architecture using Service Workers and IndexedDB
- Implement proper caching strategies for PWA assets
- Use React with functional components and hooks for UI development
- Follow Material UI design patterns for mobile-optimized interfaces
- Implement proper state management with Redux for complex application state

### Azure Functions (Backend)
- Use TypeScript for all Azure Functions
- Implement proper dependency injection patterns
- Organize functions by domain (user management, practice sessions, equipment, etc.)
- Use HTTP triggers for RESTful API endpoints
- Implement proper input validation and error handling

### Data Management
- Use Azure Cosmos DB SDK with proper partitioning strategy (user ID + session date)
- Implement optimistic concurrency for offline sync scenarios
- Use Azure Blob Storage SDK for media file management with proper SAS token security
- Follow the entity schema defined in the architecture document

### Authentication & Security
- Implement Azure AD B2C authentication with proper MSAL.js integration
- Use role-based access control for authorization
- Secure all API endpoints with proper authentication
- Implement proper CORS policies for the PWA
- Never store sensitive information in client-side code

### DevOps & CI/CD
- Follow GitHub-based workflow with feature branches and pull requests
- Create GitHub Actions workflows for CI/CD pipelines
- Implement proper testing at all levels (unit, integration, E2E)
- Use Infrastructure as Code (Bicep) for all Azure resource deployments
- Implement proper environment separation (DEV/TEST/PROD)

## Code Quality Standards

- Use consistent naming conventions across the codebase
- Implement comprehensive error handling with proper logging
- Write meaningful tests for all components
- Document all functions, classes, and complex logic
- Follow accessibility best practices for UI components

## Performance Optimization

- Implement proper caching strategies for API responses
- Optimize bundle size for the PWA
- Use lazy loading for React components
- Implement proper database query optimization
- Configure appropriate CDN settings for static assets

## Dependency Management

- Use npm for package management
- Keep dependencies updated and secure
- Use proper versioning for all dependencies
- Implement dependency scanning in CI/CD pipeline

## Specific Feature Implementation Guidelines

### Practice Session & End Tracking
- Implement hierarchical data structure (Session > End > Shot)
- Design for efficient offline data capture
- Optimize data synchronization for field usage

### Equipment Management
- Implement proper tracking of equipment usage statistics
- Design for easy equipment switching during practice

### Progress Visualization
- Use efficient charting libraries optimized for mobile
- Implement proper data aggregation for performance trends

### Weather Integration
- Use Azure Logic Apps for weather service integration
- Implement proper caching for weather data