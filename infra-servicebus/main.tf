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

# Update these variables as needed
variable "resource_group_name" {
  description = "The name of the resource group in which to create the Service Bus namespace"
  type        = string
  default     = "REPLACE_WITH_RESOURCE_GROUP"
}

variable "location" {
  description = "The Azure region to deploy resources"
  type        = string
  default     = "East US"
}

resource "azurerm_resource_group" "servicebus_rg" {
  name     = var.resource_group_name
  location = var.location
}

resource "azurerm_servicebus_namespace" "servicebus_ns" {
  name                = "mcpservicebusns${random_integer.suffix.result}"
  location            = azurerm_resource_group.servicebus_rg.location
  resource_group_name = azurerm_resource_group.servicebus_rg.name
  sku                 = "Standard"
}

resource "random_integer" "suffix" {
  min = 10000
  max = 99999
}

resource "azurerm_servicebus_queue" "servicebus_queue" {
  name         = "mcpqueue"
  namespace_id = azurerm_servicebus_namespace.servicebus_ns.id
}

resource "azurerm_servicebus_queue" "servicebus_queue_request" {
  name         = "mcpqueue-request"
  namespace_id = azurerm_servicebus_namespace.servicebus_ns.id
}

resource "azurerm_servicebus_queue" "servicebus_queue_response" {
  name         = "mcpqueue-response"
  namespace_id = azurerm_servicebus_namespace.servicebus_ns.id
}

output "servicebus_namespace_name" {
  value = azurerm_servicebus_namespace.servicebus_ns.name
}

output "servicebus_queue_name" {
  value = azurerm_servicebus_queue.servicebus_queue.name
}

output "servicebus_queue_request_name" {
  value = azurerm_servicebus_queue.servicebus_queue_request.name
}

output "servicebus_queue_response_name" {
  value = azurerm_servicebus_queue.servicebus_queue_response.name
}
