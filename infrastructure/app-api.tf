module "app_api" {
  #checkov:skip=CKV_TF_1: Use of commit hash are not required for our Terraform modules
  source = "github.com/Planning-Inspectorate/infrastructure-modules.git//modules/node-app-service?ref=1.16"

  resource_group_name = azurerm_resource_group.primary.name
  location            = module.primary_region.location

  # naming
  app_name        = "api"
  resource_suffix = var.environment
  service_name    = local.service_name
  tags            = local.tags

  # service plan
  app_service_plan_id                  = azurerm_service_plan.apps.id
  app_service_plan_resource_group_name = azurerm_resource_group.primary.name

  # container
  container_registry_name = var.tooling_config.container_registry_name
  container_registry_rg   = var.tooling_config.container_registry_rg
  image_name              = "back-office/back-office-appeals-api"

  # networking
  app_service_private_dns_zone_id = azurerm_private_dns_zone.app_service.id
  endpoint_subnet_id              = azurerm_subnet.main.id
  inbound_vnet_connectivity       = var.apps_config.private_endpoint_enabled
  integration_subnet_id           = azurerm_subnet.main.id
  outbound_vnet_connectivity      = true

  # monitoring
  action_group_ids           = local.action_group_ids
  log_analytics_workspace_id = azurerm_log_analytics_workspace.main.id
  monitoring_alerts_enabled  = var.alerts_enabled

  app_settings = {
    APPLICATIONINSIGHTS_CONNECTION_STRING      = local.key_vault_refs["app-insights-connection-string"]
    ApplicationInsightsAgent_EXTENSION_VERSION = "~3"
    NODE_ENV                                   = var.apps_config.node_environment

    # documents
    BO_BLOB_CONTAINER       = azurerm_storage_container.appeal_documents.name
    BO_BLOB_STORAGE_ACCOUNT = azurerm_storage_account.documents.primary_blob_endpoint # TODO: replace with custom domain

    # database connection
    DATABASE_NAME = azurerm_mssql_database.primary.name
    DATABASE_URL  = local.key_vault_refs["sql-app-connection-string"]

    # integrations
    GOV_NOTIFY_API_KEY   = local.key_vault_refs["appeals-bo-gov-notify-api-key"]
    MOCK_HORIZON         = var.apps_config.integrations.horizon_mock
    SERVICE_BUS_ENABLED  = var.apps_config.integrations.service_bus_broadcast_enabled
    SERVICE_BUS_HOSTNAME = "${azurerm_servicebus_namespace.main.name}.servicebus.windows.net"
    SRV_HORIZON_URL      = var.apps_config.integrations.horizon_api_url
    TEST_MAILBOX         = local.key_vault_refs["appeals-bo-test-mailbox"]
  }

  providers = {
    azurerm         = azurerm
    azurerm.tooling = azurerm.tooling
  }
}

## RBAC for secrets
resource "azurerm_role_assignment" "app_api_secrets_user" {
  scope                = azurerm_key_vault.main.id
  role_definition_name = "Key Vault Secrets User"
  principal_id         = module.app_api.principal_id
}