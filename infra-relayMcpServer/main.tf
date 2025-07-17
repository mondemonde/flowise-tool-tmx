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

# Azure Container Registry
resource "azurerm_container_registry" "relay_acr" {
  name                = var.acr_name
  resource_group_name = azurerm_resource_group.relay.name
  location            = azurerm_resource_group.relay.location
  sku                 = var.acr_sku
  admin_enabled       = true
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
    always_on = true
    application_stack {
      docker_image_name   = var.container_image
      docker_registry_url = "https://${var.acr_login_server}"
      docker_registry_username = var.acr_username
      docker_registry_password = var.acr_password
    }
  }

  app_settings = {
    WEBSITES_PORT                        = "8080"
    PORT                                 = "8080"
    AZURE_SERVICEBUS_CONNECTION_STRING   = var.azure_servicebus_connection_string
    AZURE_SERVICEBUS_REQUEST_QUEUE       = var.azure_servicebus_request_queue
    AZURE_SERVICEBUS_RESPONSE_QUEUE      = var.azure_servicebus_response_queue
    AZURE_SERVICEBUS_RESPONSE_TIMEOUT_MS = var.azure_servicebus_response_timeout_ms
    NODE_ENV                             = "production"
    DOCKER_REGISTRY_SERVER_URL           = "https://${var.acr_login_server}"
    DOCKER_REGISTRY_SERVER_USERNAME      = var.acr_username
    DOCKER_REGISTRY_SERVER_PASSWORD      = var.acr_password
  }
}

output "relay_mcp_server_url" {
  value = azurerm_linux_web_app.relay.default_hostname
  description = "The default hostname of the deployed relay MCP server"
}

output "acr_login_server" {
  value       = azurerm_container_registry.relay_acr.login_server
  description = "The login server of the Azure Container Registry"
}

output "acr_username" {
  value       = azurerm_container_registry.relay_acr.admin_username
  description = "The admin username for the Azure Container Registry"
}

output "acr_password" {
  value       = azurerm_container_registry.relay_acr.admin_password
  description = "The admin password for the Azure Container Registry"
  sensitive   = true
}
