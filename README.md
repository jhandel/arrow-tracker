# Arrow Tracker

A Progressive Web Application (PWA) that helps archers log their practices and analyze progress over time.

## Overview

Arrow Tracker is designed to provide archers with a comprehensive tool for tracking practice sessions, logging shots, and analyzing performance trends. The application works offline, making it ideal for use at archery ranges without reliable internet connectivity.

## Key Features

- **User Profile Management**: Create and manage archer profiles with equipment setups
- **Practice Session Logging**: Record practice sessions with environmental conditions
- **End Tracking**: Track groups of arrows shot in sequence with target information
- **Shot Tracking**: Record individual arrow shots within each end
- **Equipment Management**: Track multiple bows, arrow sets, and accessories
- **Statistical Analysis**: Analyze performance trends over time
- **Offline Functionality**: Use the app without internet connection and sync later

## Technology Stack

- **Frontend**: Progressive Web App built with React, Redux, and Material UI
- **Backend**: Azure Functions with TypeScript
- **Database**: Azure Cosmos DB with offline sync capabilities
- **Storage**: Azure Blob Storage for target images
- **Authentication**: Azure Active Directory B2C
- **CI/CD**: GitHub Actions

## Architecture

The application follows a modern cloud-native architecture with:
- Offline-first PWA frontend
- Serverless backend using Azure Functions
- Multi-model database with Cosmos DB
- Secure authentication with Azure AD B2C

For detailed architecture information, see the [High Level Architecture](docs/Design/HighLevelArchitecture.md) document.

## Requirements

For a complete list of application requirements, see the [High Level Requirements](docs/Design/HighLevelRequirements.md) document.

## Getting Started

*Coming soon*

## Development

*Coming soon*

## License

*Coming soon*