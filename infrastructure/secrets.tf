# # unsure on this one

# Will this name need changing for each env
resource "azurerm_key_vault" "appeals_back_office_kv" {
  name                        = "${local.org}-kv-appeals-bo-${var.environment}"
  location                    = module.azure_region.location
  resource_group_name         = azurerm_resource_group.appeals_back_office_rg1.name
  enabled_for_disk_encryption = true
  tenant_id                   = data.azurerm_client_config.current.tenant_id
  soft_delete_retention_days  = 7
  purge_protection_enabled    = false

  sku_name = "standard"

  access_policy {
    tenant_id = data.azurerm_client_config.current.tenant_id
    object_id = data.azurerm_client_config.current.object_id

    key_permissions = [
      "Get",
    ]

    secret_permissions = [
      "Get",
    ]

    storage_permissions = [
      "Get",
    ]
  }
}

# Is this referencing components/appeals-app-services/locals/ secret_names = concat(local.secrets_manual, local.secrets_automated)
# resource "azurerm_key_vault_secret" "app_secret" {
#   for_each = toset(module.app_services.secret_names)

#   key_vault_id = azurerm_key_vault.appeals_back_office_kv.name
#   name         = each.value
#   value        = "<enter_value>"

#   tags = local.tags

#   lifecycle {
#     ignore_changes = [
#       value
#     ]
#   }
# }

# resource "azurerm_key_vault_secret" "bo_app_insights_connection_string" {
#   content_type = "text/plain"
#   key_vault_id = azurerm_key_vault.appeals_back_office_kv.name
#   name         = "back-office-app-insights-connection-string"
#   value        = azurerm_application_insights.back_office_app_insights.connection_string

#   tags = local.tags
# }

# resource "azurerm_key_vault_secret" "bo_appeals_insights_connection_string" {
#   content_type = "text/plain"
#   key_vault_id = azurerm_key_vault.appeals_back_office_kv.name
#   name         = "back-office-appeals-insights-connection-string"
#   value        = azurerm_application_insights.back_office_appeals_insights.connection_string

#   tags = local.tags
# }

# resource "azurerm_key_vault_secret" "back_office_applications_api_key_web" {
#   content_type = "array"
#   key_vault_id = azurerm_key_vault.appeals_back_office_kv.name
#   name         = "backoffice-applications-api-key-web"
#   value        = ""

#   tags = local.tags

#   lifecycle {
#     # api key rotation is handled by pipeline script
#     ignore_changes = [value]
#   }
# }

# resource "azurerm_key_vault_secret" "back_office_applications_api_key_function" {
#   content_type = "array"
#   key_vault_id = azurerm_key_vault.appeals_back_office_kv.name
#   name         = "backoffice-applications-api-key-function"
#   value        = ""

#   tags = local.tags

#   lifecycle {
#     # api key rotation is handled by pipeline script
#     ignore_changes = [value]
#   }
# }

# resource "azurerm_key_vault_secret" "back_office_applications_api_key_swagger" {
#   content_type = "array"
#   count        = var.environment == "dev" ? 1 : 0
#   key_vault_id = azurerm_key_vault.appeals_back_office_kv.name
#   name         = "backoffice-applications-api-key-swagger"
#   value        = ""

#   tags = local.tags

#   lifecycle {
#     # api key rotation is handled by pipeline script
#     ignore_changes = [value]
#   }
# }
