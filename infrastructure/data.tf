# data "azurerm_monitor_action_group" "bo_appeals_tech" {
#   resource_group_name = azurerm_resource_group.appeals_back_office_rg1.name
#   name                = var.action_group_names.bo_appeals_tech
# }

data "azurerm_key_vault_secret" "environment_key_vault" {
  name         = "secret-${var.environment}"
  key_vault_id = azurerm_key_vault.appeals_back_office_kv.id
}

output "key_vault_id" {
  description = "The ID of the key vault so App Services can pull secret values"
  value       = azurerm_key_vault.appeals_back_office_kv.id
  sensitive   = true
}
