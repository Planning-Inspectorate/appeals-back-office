module "app_web" {
  #checkov:skip=CKV_TF_1: Use of commit hash are not required for our Terraform modules
  source = "github.com/Planning-Inspectorate/infrastructure-modules.git//modules/node-app-service?ref=7e4e94e"

  resource_group_name = azurerm_resource_group.primary.name
  location            = module.primary_region.location

  tooling_config = var.tooling_config

  # naming
  app_name        = "web"
  resource_suffix = var.environment
  service_name    = local.service_name
  tags            = local.tags

  # service plan
  app_service_plan_id                  = azurerm_service_plan.apps.id
  app_service_plan_resource_group_name = azurerm_resource_group.primary.name

  # container
  container_registry_name = var.tooling_config.container_registry_name
  container_registry_rg   = var.tooling_config.container_registry_rg
  image_name              = "back-office/appeals-web"

  # networking
  app_service_private_dns_zone_id = data.azurerm_private_dns_zone.app_service.id
  front_door_restriction          = true
  inbound_vnet_connectivity       = false
  integration_subnet_id           = azurerm_subnet.apps.id
  outbound_vnet_connectivity      = true

  # monitoring
  action_group_ids           = local.action_group_ids
  log_analytics_workspace_id = azurerm_log_analytics_workspace.main.id
  monitoring_alerts_enabled  = var.alerts_enabled
  health_check_path          = "/health"

  app_settings = {
    APPLICATIONINSIGHTS_CONNECTION_STRING      = local.key_vault_refs["app-insights-connection-string"]
    ApplicationInsightsAgent_EXTENSION_VERSION = "~3"
    NODE_ENV                                   = var.apps_config.node_environment

    API_HOST     = "https://${module.app_api.default_site_hostname}"
    APP_HOSTNAME = var.web_app_domain

    # auth
    APPEALS_CASE_OFFICER_GROUP_ID = var.apps_config.auth.group_ids.case_officer
    APPEALS_CS_TEAM_GROUP_ID      = var.apps_config.auth.group_ids.cs_team
    APPEALS_INSPECTOR_GROUP_ID    = var.apps_config.auth.group_ids.inspector
    APPEALS_LEGAL_TEAM_GROUP_ID   = var.apps_config.auth.group_ids.legal
    APPEALS_PADS_GROUP_ID         = var.apps_config.auth.group_ids.pads
    APPEALS_READERS_GROUP_ID      = var.apps_config.auth.group_ids.read_only
    AUTH_CLIENT_ID                = var.apps_config.auth.client_id
    AUTH_CLIENT_SECRET            = local.key_vault_refs["appeals-bo-client-secret"]
    AUTH_CLOUD_INSTANCE_ID        = "https://login.microsoftonline.com"
    AUTH_REDIRECT_PATH            = "/auth/redirect"
    AUTH_TENANT_ID                = data.azurerm_client_config.current.tenant_id

    # documents
    AZURE_BLOB_DEFAULT_CONTAINER = azurerm_storage_container.appeal_documents.name
    AZURE_BLOB_STORE_HOST        = azurerm_storage_account.documents.primary_blob_endpoint # TODO: replace with custom domain

    # logging
    LOG_LEVEL_FILE   = var.apps_config.logging.level_file
    LOG_LEVEL_STDOUT = var.apps_config.logging.level_stdout

    # sessions
    REDIS_CONNECTION_STRING = local.key_vault_refs["redis-connection-string"]
    SESSION_SECRET          = local.key_vault_refs["session-secret"]

    # integration
    HORIZON_APPEAL_BASE_URL = var.apps_config.integrations.horizon_web_url

    # retries
    RETRY_MAX_ATTEMPTS = "3"
    # got default retry codes
    # https://github.com/sindresorhus/got/blob/main/documentation/7-retry.md
    RETRY_STATUS_CODES = "408,413,429,500,502,503,504,521,522,524"

    #feature flags
    FEATURE_FLAG_S78_WRITTEN = var.apps_config.featureFlags.featureFlagS78Written
  }

  # providers = {
  #   azurerm = azurerm
  #   azurerm.tooling = azurerm.tooling
  # }
}

## RBAC for secrets
resource "azurerm_role_assignment" "app_web_secrets_user" {
  scope                = azurerm_key_vault.main.id
  role_definition_name = "Key Vault Secrets User"
  principal_id         = module.app_web.principal_id
}

## sessions
resource "random_password" "session_secret" {
  length  = 32
  special = true
}

resource "azurerm_key_vault_secret" "session_secret" {
  #checkov:skip=CKV_AZURE_41: TODO: Secret rotation
  key_vault_id = azurerm_key_vault.main.id
  name         = "${local.service_name}-session-secret"
  value        = random_password.session_secret.result
  content_type = "session-secret"

  tags = local.tags
}
