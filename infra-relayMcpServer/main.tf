terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
  required_version = ">= 1.0.0"
}

provider "azurerm" {
  features {}
}

# Variables

# Resource Group (create if it does not exist)
resource "azurerm_resource_group" "relay" {
  name     = var.resource_group_name
  location = var.location
}

# App Service Plan
resource "azurerm_app_service_plan" "relay" {
  name                = "${var.app_name}-plan"
  location            = azurerm_resource_group.relay.location
  resource_group_name = azurerm_resource_group.relay.name
  kind                = "Linux"
  reserved            = true

  sku {
    tier = "Basic"
    size = var.app_service_plan_sku
  }
}

# App Service (Web App)
resource "azurerm_linux_web_app" "relay" {
  name                = var.app_name
  location            = azurerm_resource_group.relay.location
  resource_group_name = azurerm_resource_group.relay.name
  service_plan_id     = azurerm_app_service_plan.relay.id

  site_config {
    application_stack {
      node_version = "18-lts"
    }
  }

  app_settings = {
    AZURE_SERVICEBUS_CONNECTION_STRING = var.azure_servicebus_connection_string
    AZURE_SERVICEBUS_REQUEST_QUEUE     = var.azure_servicebus_request_queue
    AZURE_SERVICEBUS_RESPONSE_QUEUE    = var.azure_servicebus_response_queue
    NODE_ENV                          = "production"
  }
}

output "relay_mcp_server_url" {
  value = azurerm_linux_web_app.relay.default_hostname
  description = "The default hostname of the deployed relay MCP server"
}
