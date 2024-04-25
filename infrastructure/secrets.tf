# # unsure on this one
# # resource "azurerm_key_vault_secret" "app_secret" {
# #   for_each = toset(module.app_services.secret_names)

# #   key_vault_id = azurerm_key_vault.appeals_back_office_kv.name
# #   name         = each.value
# #   value        = "<enter_value>"

# #   tags = local.tags

# #   lifecycle {
# #     ignore_changes = [
# #       value
# #     ]
# #   }
# # }

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
