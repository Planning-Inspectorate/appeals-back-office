locals {
  org                = "pins"
  service_name       = "appeals-bo"
  primary_location   = "uk-south"
  secondary_location = "uk-west"

  resource_suffix           = "${local.service_name}-${var.environment}"
  secondary_resource_suffix = "${local.service_name}-secondary-${var.environment}"

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
  # action group id object for passing to node-app-service module
}
