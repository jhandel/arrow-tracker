---
layout: default
---
# Running Context Log

This document tracks prompts and agent actions throughout the Arrow Tracker application development process.

## Interaction History

| Date | Prompt | Agent Action Summary |
|------|--------|----------------------|
| April 12, 2025 | "Create a requirements outline for a mobile application called 'Arrow Tracker' the application will help archers log their practices and analyze progress over time." | Created HighLevelRequirements.md with a comprehensive table of features for Arrow Tracker mobile app. |
| April 12, 2025 | "Add a feature for 'End Tracking' an end is a set of shots inside a practice session and should include tracking the specific target being shot at, the distance it was shot at from and be where shots tracking is input..." | Updated HighLevelRequirements.md to add End Tracking (F003) and modified Shot Tracking (F004) to reflect the hierarchical relationship. |
| April 12, 2025 | "Based on this requirements document suggest a Progressive Web App platform backed by a cloud based API that will be run in Azure." | Created HighLevelArchitecture.md detailing PWA architecture with Azure backend services and infrastructure. |
| April 12, 2025 | "Draw the architecture using Mermaid" | Updated HighLevelArchitecture.md to replace placeholder image reference with detailed Mermaid architecture diagram. |
| April 12, 2025 | "Update the architecture to be based on using GitHub as the SDLC and CI/CD platform" | Modified HighLevelArchitecture.md to replace Azure DevOps with GitHub Actions for CI/CD and added GitHub-based development workflow. |
| April 12, 2025 | "Move these documents into a folder named 'Design'" | Created Design folder and moved documentation files (HighLevelRequirements.md and HighLevelArchitecture.md) into it. |
| April 12, 2025 | "Move the design folder into a docs folder" | Created docs folder and moved Design folder (with documentation) into it. |
| April 12, 2025 | "Create a document called 'running-context.md' and when ever I give you a command in the future add the prompt to the document in a table with the prompt and a brief summary of what you did as an agent." | Created running-context.md file to track all prompts and agent actions throughout development. |
| April 12, 2025 | "Based on the High Level Architecture update the copilot-instructions to provide best practices to you as an agent for the development of this solution." | Created comprehensive copilot-instructions.md in .github folder with architecture-specific guidelines for PWA frontend, Azure Functions backend, data management, authentication, and DevOps workflow. |
| April 12, 2025 | "Add this project to Github" | Initialized Git repository, created .gitignore and README.md files, and made initial commit. Provided instructions for creating GitHub repository and pushing code. |
| April 12, 2025 | "add instructions to the copilot-instructions to always update the running-context.md file and include it in context for all future calls so that agents have a historical context to learn from." | Added a new "Documentation & Context Management" section to copilot-instructions.md with specific guidelines for maintaining the running-context.md file and using it for historical context in future development. |
| April 12, 2025 | "add an index file to the docs folder and create a gh action to publish this to gh pages." | Created comprehensive index.md for the docs folder as landing page for GitHub Pages and set up a GitHub Actions workflow (github-pages.yml) to build and deploy the Jekyll site to GitHub Pages. |