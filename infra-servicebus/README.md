# Azure Service Bus Infrastructure (Terraform)

This folder contains Terraform configuration to provision an Azure Service Bus namespace and queue for use by the MCP server and related microservices.

## Project Overview

- **Purpose:** Automate the creation of Azure Service Bus resources using Terraform, following best practices for infrastructure-as-code.
- **Resources Provisioned:**
  - Azure Resource Group
  - Azure Service Bus Namespace (with randomized suffix for uniqueness)
  - Azure Service Bus Queue

## Prerequisites

- Azure CLI installed and authenticated (`az login`)
- Terraform installed (>= 1.0.0)
- Sufficient permissions to create resources in your Azure subscription

## Usage

1. **Initialize Terraform:**
   ```sh
   terraform init
   ```

2. **Apply the configuration:**
   ```sh
   terraform apply -var="resource_group_name=YOUR_RESOURCE_GROUP"
   ```
   Replace `YOUR_RESOURCE_GROUP` with your desired resource group name.

3. **Retrieve output values:**
   ```sh
   terraform output
   ```

## Example Terraform Apply Output

Below is a sample output you should see after a successful `terraform apply`:

```
Apply complete! Resources: 3 added, 0 changed, 0 destroyed.

Outputs:

servicebus_namespace_name = "mcpservicebusns12345"
servicebus_queue_name = "mcpqueue"

```

- `servicebus_namespace_name`: The name of the created Service Bus namespace.
- `servicebus_queue_name`: The name of the created Service Bus queue.

Real Outputs:

servicebus_namespace_name = "mcpservicebusns21651"
servicebus_queue_name = "mcpqueue"

## Next Steps

- Use the output values to configure your MCP server or other microservices to connect to the Azure Service Bus.
- For connection strings and access policies, refer to the Azure Portal or extend this Terraform configuration to output those values.

---
