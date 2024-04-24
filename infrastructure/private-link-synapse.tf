# data "azurerm_private_dns_zone" "sql_synapse_dns_zone" {
#   name                = "privatelink.sql.azuresynapse.net"
#   resource_group_name = var.common_resource_group_name
# }

# resource "azurerm_private_endpoint" "private_endpoint" {
#   count = var.odw_synapse_integration_enabled ? 1 : 0

#   name                = "pins-pe-${local.service_name}-synapse-sql-${local.resource_suffix}"
#   location            = module.azure_region.location
#   resource_group_name = azurerm_resource_group.appeals_back_office_rg1.name
#   subnet_id           = azurerm_subnet.back_office_ingress.id

#   private_service_connection {
#     name                           = "pins-psc-${local.service_name}-synapse-sql-${local.resource_suffix}"
#     private_connection_resource_id = one(data.terraform_remote_state.odw).outputs.synapse_workspace_id
#     subresource_names              = ["sqlondemand"]
#     is_manual_connection           = false
#   }

#   private_dns_zone_group {
#     name                 = "pins-pdns-${local.service_name}-synapse-sql-${local.resource_suffix}"
#     private_dns_zone_ids = [data.azurerm_private_dns_zone.sql_synase_dns_zone.id]
#   }
# }

# # Variables

# variable "common_resource_group_name" {
#   description = "The common infrastructure resource group name"
#   type        = string
# }

# variable "odw_synapse_integration_enabled" {
#   description = "Whether or not Synapse Migration Integration is enabled"
#   type        = bool
#   default     = false
# }

# # May need to rename the resources so no overlap
# # Not edited this file
# Perhaps best to leave PEs til last
