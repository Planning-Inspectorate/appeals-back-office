locals {
  org                = "pins"
  service_name       = "appeals-bo"
  primary_location   = "uk-south"
  secondary_location = "uk-west"

  resource_suffix           = "${local.service_name}-${var.environment}"
  secondary_resource_suffix = "${local.service_name}-secondary-${var.environment}"
  # if equals "training" will shorten to "train" so storage account name length is upto 24 chars
  environment = var.environment == "training" ? "train" : var.environment
  # keep the suffix short for training env, as it can only be upto 24 characters total for azurerm_storage_account
  shorter_resource_suffix = var.environment == "training" ? "${local.service_name}-${"train"}" : local.resource_suffix

  service_bus_hostname = "${azurerm_servicebus_namespace.main.name}.servicebus.windows.net"

  secrets = [
    "appeals-bo-client-secret",
    "appeals-bo-gov-notify-api-key",
    "appeals-bo-test-mailbox"
  ]

  key_vault_refs = merge(
    {
      for k, v in azurerm_key_vault_secret.manual_secrets : k => "@Microsoft.KeyVault(SecretUri=${v.versionless_id})"
    },
    {
      "app-insights-connection-string" = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault_secret.app_insights_connection_string.versionless_id})",
      "redis-connection-string"        = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault_secret.redis_web_connection_string.versionless_id})"
      "session-secret"                 = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault_secret.session_secret.versionless_id})"
      "sql-app-connection-string"      = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault_secret.sql_app_connection_string.versionless_id})"
    }
  )

  tags = merge(
    var.tags,
    {
      CreatedBy   = "Terraform"
      Environment = var.environment
      ServiceName = local.service_name
      location    = local.primary_location
    }
  )

  action_group_ids = {
    tech            = data.azurerm_monitor_action_group.common["bo_tech"].id,
    service_manager = data.azurerm_monitor_action_group.common["bo_service_manager"].id,
    iap             = data.azurerm_monitor_action_group.common["iap"].id,
    its             = data.azurerm_monitor_action_group.common["its"].id,
    info_sec        = data.azurerm_monitor_action_group.common["info_sec"].id
  }
  tech_emails = [for rec in data.azurerm_monitor_action_group.common["bo_tech"].email_receiver : rec.email_address]

  documents = {
    # strip leading "https://" and trailing "/" to leave just the domain names
    domain       = replace(replace(var.documents_config.domain, "https://", ""), "/", "")
    blob_endpont = replace(replace(azurerm_storage_account.documents.primary_blob_endpoint, "https://", ""), "/", "")
  }
}
