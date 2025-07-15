# Azure App Service Deployment for Relay MCP Server (Terraform)

This folder contains Terraform configuration to deploy the relay MCP server (mcp-nest-servicebus-relay) as an Azure App Service (Linux, Node.js 18).

## Overview

- **Purpose:** Automate the deployment of the relay MCP server to Azure, making it accessible to Flowise and other clients.
- **Resources Provisioned:**
  - Azure App Service Plan (Linux)
  - Azure App Service (Web App) for Node.js
- **App Settings:** Configure your Azure Service Bus connection and queue names as environment variables.

## Prerequisites

- Azure CLI installed and authenticated (`az login`)
- Terraform installed (>= 1.0.0)
- An existing Azure Resource Group (or create one)
- Docker or Node.js build pipeline for deploying your app code (not handled by Terraform)

## Usage

1. **Set variables:**  
   Edit or provide the following variables:
   - `resource_group_name` (required): Name of your Azure resource group
   - `location` (optional): Azure region (default: East US)
   - `app_service_plan_sku` (optional): App Service Plan SKU (default: B1)
   - `app_name` (optional): Web app name (default: relay-mcp-server)

2. **Initialize Terraform:**
   ```
   terraform init
   ```

3. **Apply the configuration:**
   ```
   terraform apply -var="resource_group_name=YOUR_RESOURCE_GROUP"
   ```

4. **Configure App Settings:**  
   Add your environment variables (Service Bus connection, queue names) in the `app_settings` block in `main.tf`, or set them in the Azure Portal after deployment.

   Example:
   ```
   app_settings = {
     AZURE_SERVICEBUS_CONNECTION_STRING = "..."
     AZURE_SERVICEBUS_REQUEST_QUEUE     = "..."
     AZURE_SERVICEBUS_RESPONSE_QUEUE    = "..."
     NODE_ENV                          = "production"
   }
   ```

5. **Deploy your app code:**  
   Use your preferred CI/CD pipeline (GitHub Actions, Azure DevOps, or manual deployment) to deploy the mcp-nest-servicebus-relay code to the created App Service.

6. **Get the App URL:**  
   After deployment, Terraform will output the default hostname of your relay MCP server.

## Outputs

- `relay_mcp_server_url`: The default hostname of the deployed relay MCP server.

## Notes

- This Terraform config does not handle code deployment. Use Azure App Service deployment options to publish your Node.js app.
- Ensure your app listens on the port provided by the `PORT` environment variable (default for Azure App Service).

---
