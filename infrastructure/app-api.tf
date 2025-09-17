module "app_api" {
  #checkov:skip=CKV_TF_1: Use of commit hash are not required for our Terraform modules
  source = "github.com/Planning-Inspectorate/infrastructure-modules.git//modules/node-app-service?ref=1.49"

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
  app_service_private_dns_zone_id = data.azurerm_private_dns_zone.app_service.id
  endpoint_subnet_id              = azurerm_subnet.main.id
  inbound_vnet_connectivity       = var.apps_config.private_endpoint_enabled
  integration_subnet_id           = azurerm_subnet.apps.id
  outbound_vnet_connectivity      = true
  public_network_access           = !var.apps_config.private_endpoint_enabled

  # monitoring
  action_group_ids                  = local.action_group_ids
  log_analytics_workspace_id        = azurerm_log_analytics_workspace.main.id
  monitoring_alerts_enabled         = var.alerts_enabled
  health_check_path                 = "/health"
  health_check_eviction_time_in_min = var.health_check_eviction_time_in_min

  app_settings = {
    APPLICATIONINSIGHTS_CONNECTION_STRING      = local.key_vault_refs["app-insights-connection-string"]
    ApplicationInsightsAgent_EXTENSION_VERSION = "~3"
    NODE_ENV                                   = var.apps_config.node_environment
    FRONT_OFFICE_URL                           = var.apps_config.front_office_url

    # documents
    BO_BLOB_CONTAINER       = azurerm_storage_container.appeal_documents.name
    BO_BLOB_STORAGE_ACCOUNT = azurerm_storage_account.documents.primary_blob_endpoint # TODO: replace with custom domain

    # database connection
    DATABASE_NAME    = azurerm_mssql_database.primary.name
    DATABASE_URL     = local.key_vault_refs["sql-app-connection-string"]
    QUERY_BATCH_SIZE = 2000

    # integrations
    GOV_NOTIFY_API_KEY    = local.key_vault_refs["appeals-bo-gov-notify-api-key"]
    MOCK_HORIZON          = var.apps_config.integrations.horizon_mock
    SERVICE_BUS_ENABLED   = var.apps_config.integrations.service_bus_broadcast_enabled
    SERVICE_BUS_HOSTNAME  = local.service_bus_hostname
    SRV_HORIZON_URL       = var.apps_config.integrations.horizon_api_url
    TIMEOUT_LIMIT_HORIZON = var.apps_config.integrations.horizon_timeout
    TEST_MAILBOX          = local.key_vault_refs["appeals-bo-test-mailbox"]
    ENABLE_TEST_ENDPOINTS = var.apps_config.integrations.enable_test_endpoints

    # notify template
    GOV_NOTIFY_APPEAL_GENERIC_ID = var.apps_config.integrations.notify_template_ids.appeal_generic_id

    #feature flags
    FEATURE_FLAG_S78_WRITTEN        = var.apps_config.featureFlags.featureFlagS78Written
    FEATURE_FLAG_S78_HEARING        = var.apps_config.featureFlags.featureFlagS78Hearing
    FEATURE_FLAG_S78_INQUIRY        = var.apps_config.featureFlags.featureFlagS78Inquiry
    FEATURE_FLAG_LINKED_APPEALS     = var.apps_config.featureFlags.featureFlagLinkedAppeals
    FEATURE_FLAG_S20                = var.apps_config.featureFlags.featureFlagS20
    FEATURE_FLAG_CAS                = var.apps_config.featureFlags.featureFlagCAS
    FEATURE_FLAG_CAS_ADVERT         = var.apps_config.featureFlags.featureFlagCasAdvert
    FEATURE_FLAG_NET_RESIDENCE      = var.apps_config.featureFlags.featureFlagNetResidence
    FEATURE_FLAG_NET_RESIDENCE_S20  = var.apps_config.featureFlags.featureFlagNetResidenceS20
    FEATURE_FLAG_ADVERTISEMENT      = var.apps_config.featureFlags.featureFlagAdvertisement
    FEATURE_FLAG_CHANGE_APPEAL_TYPE = var.apps_config.featureFlags.featureFlagChangeAppealType
    FEATURE_FLAG_HEARING_POST_MVP   = var.apps_config.featureFlags.featureFlagHearingPostMvp
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

## RBAC for service bus
resource "azurerm_role_assignment" "app_api_service_bus" {
  scope                = azurerm_servicebus_namespace.main.id
  role_definition_name = "Azure Service Bus Data Sender"
  principal_id         = module.app_api.principal_id
}

## RBAC for secrets (staging slot)
resource "azurerm_role_assignment" "app_api_staging_secrets_user" {
  scope                = azurerm_key_vault.main.id
  role_definition_name = "Key Vault Secrets User"
  principal_id         = module.app_api.staging_principal_id
}

## RBAC for service bus (staging slot)
resource "azurerm_role_assignment" "app_api_staging_service_bus" {
  scope                = azurerm_servicebus_namespace.main.id
  role_definition_name = "Azure Service Bus Data Sender"
  principal_id         = module.app_api.staging_principal_id
}
