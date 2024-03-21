resource "azurerm_key_vault_secret" "app_secret" {
  #checkov:skip=CKV_AZURE_41: TODO: Secret rotation
  #checkov:skip=CKV_AZURE_114: No need to set content type via Terraform, as secrets to be updated in Portal
  for_each = toset(module.app_services.secret_names)

  key_vault_id = var.key_vault_id
  name         = each.value
  value        = "<enter_value>"

  tags = local.tags

  lifecycle {
    ignore_changes = [
      value
    ]
  }
}

resource "azurerm_key_vault_secret" "bo_appeals_insights_connection_string" {
  #checkov:skip=CKV_AZURE_41

  content_type = "text/plain"
  key_vault_id = var.key_vault_id
  name         = "back-office-appeals-insights-connection-string"
  value        = azurerm_application_insights.back_office_appeals_insights.connection_string

  tags = local.tags
}

resource "azurerm_key_vault_secret" "back_office_appeals_api_key_web" {
  #checkov:skip=CKV_AZURE_41

  content_type = "array"
  key_vault_id = var.key_vault_id
  name         = "backoffice-applications-api-key-web"
  value        = ""

  tags = local.tags

  lifecycle {
    # api key rotation is handled by pipeline script
    ignore_changes = [value]
  }
}

resource "azurerm_key_vault_secret" "back_office_appeals_api_key_function" {
  #checkov:skip=CKV_AZURE_41

  content_type = "array"
  key_vault_id = var.key_vault_id
  name         = "backoffice-applications-api-key-function"
  value        = ""

  tags = local.tags

  lifecycle {
    # api key rotation is handled by pipeline script
    ignore_changes = [value]
  }
}

resource "azurerm_key_vault_secret" "back_office_appeals_api_key_swagger" {
  #checkov:skip=CKV_AZURE_41

  content_type = "array"
  count        = var.environment == "dev" ? 1 : 0
  key_vault_id = var.key_vault_id
  name         = "backoffice-applications-api-key-swagger"
  value        = ""

  tags = local.tags

  lifecycle {
    # api key rotation is handled by pipeline script
    ignore_changes = [value]
  }
}
