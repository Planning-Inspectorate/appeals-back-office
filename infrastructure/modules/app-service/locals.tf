locals {
  resource_suffix = "${var.environment}-${module.azure_region_ukw.location_short}-${var.instance}"

  app_services = {
    back_office_appeals_frontend = {
      app_name                   = "appeals-wfe"
      front_door_restriction     = true
      image_name                 = "back-office/appeals-web"
      inbound_vnet_connectivity  = false
      integration_subnet_id      = var.integration_subnet_id
      key_vault_access           = true
      outbound_vnet_connectivity = true
      action_group_ids           = local.bo_appeals_action_group_ids

      app_settings = {
        APPLICATIONINSIGHTS_CONNECTION_STRING      = "@Microsoft.KeyVault(SecretUri=${var.key_vault_uri}secrets/back-office-appeals-insights-connection-string/)"
        ApplicationInsightsAgent_EXTENSION_VERSION = "~3"
        AUTH_REDIRECT_PATH                         = "/auth/redirect"

        API_HOST                      = "https://pins-app-${var.service_name}-appeals-api-${var.resource_suffix}.azurewebsites.net"
        APP_HOSTNAME                  = var.back_office_appeals_hostname
        AUTH_CLIENT_ID                = var.azuread_auth_client_id
        AUTH_CLIENT_SECRET            = local.secret_refs["back-office-client-secret"]
        AUTH_CLOUD_INSTANCE_ID        = "https://login.microsoftonline.com"
        AUTH_TENANT_ID                = data.azurerm_client_config.current.tenant_id
        APPEALS_INSPECTOR_GROUP_ID    = var.azuread_appeals_inspector_group_id
        APPEALS_CASE_OFFICER_GROUP_ID = var.azuread_appeals_case_officer_group_id
        APPEALS_LEGAL_TEAM_GROUP_ID   = var.azuread_appeals_legal_team_group_id
        APPEALS_CS_TEAM_GROUP_ID      = var.azuread_appeals_cs_team_group_id
        AZURE_BLOB_STORE_HOST         = var.bo_appeals_storage_account_endpoint
        AZURE_BLOB_DEFAULT_CONTAINER  = var.bo_appeals_document_container_name
        LOG_LEVEL_FILE                = var.node_log_level_file
        LOG_LEVEL_STDOUT              = var.node_log_level_stdout
        NODE_ENV                      = var.node_environment
        REDIS_CONNECTION_STRING       = local.existing_secret_refs[var.back_office_appeals_redis_connection_string_secret_name]
        SESSION_SECRET                = local.secret_refs["session-secret"]
        HORIZON_APPEAL_BASE_URL       = var.horizon_web_url
      }
    }

    back_office_appeals_api = {
      app_name                        = "appeals-api"
      app_service_private_dns_zone_id = var.app_service_private_dns_zone_id
      endpoint_subnet_id              = var.private_endpoint_enabled ? var.endpoint_subnet_id : null
      image_name                      = "back-office/back-office-appeals-api"
      inbound_vnet_connectivity       = var.private_endpoint_enabled
      integration_subnet_id           = var.integration_subnet_id
      key_vault_access                = true
      outbound_vnet_connectivity      = true
      action_group_ids                = local.bo_appeals_action_group_ids

      app_settings = {
        APPLICATIONINSIGHTS_CONNECTION_STRING      = "@Microsoft.KeyVault(SecretUri=${var.key_vault_uri}secrets/back-office-appeals-insights-connection-string/)"
        ApplicationInsightsAgent_EXTENSION_VERSION = "~3"
        DATABASE_URL                               = var.appeals_database_connection_string
        SRV_HORIZON_URL                            = var.horizon_api_url
        MOCK_HORIZON                               = var.horizon_mock_integration
        NODE_ENV                                   = var.node_environment
        SERVICE_BUS_HOSTNAME                       = "${var.service_bus_namespace_name}.servicebus.windows.net"
        SERVICE_BUS_ENABLED                        = var.feature_appeal_broadcasts_enabled
        GOV_NOTIFY_API_KEY                         = local.secret_refs["back-office-appeals-gov-notify-api-key"]
        TEST_MAILBOX                               = local.secret_refs["back-office-appeals-test-mailbox"]
        BO_BLOB_STORAGE_ACCOUNT                    = var.bo_appeals_storage_account_endpoint
        BO_BLOB_CONTAINER                          = var.bo_appeals_document_container_name
      }
    }
  }

  secret_names = [
    "back-office-client-secret",
    "back-office-topic-key",
    "os-places-api-key",
    "session-secret",
    "back-office-appeals-gov-notify-api-key",
    "back-office-appeals-test-mailbox",
  ]

  secret_refs = {
    for name in local.secret_names : name => "@Microsoft.KeyVault(SecretUri=${var.key_vault_uri}secrets/${name}/)"
  }

  # These are secrets we don't intend to create, but just need a reference to
  existing_secret_names = [
    # created as part of redis cache setup
    var.back_office_appeals_redis_connection_string_secret_name,
    "applications-service-encryption-secret-key",
    "back-office-gov-notify-api-key",
    # This would ideally be in the secret_names list, but there's no way to add a value to the secret generation loop
    "back-office-sql-server-connection-string",
    "back-office-sql-server-connection-string-app",
  ]

  existing_secret_refs = {
    for name in local.existing_secret_names : name => "@Microsoft.KeyVault(SecretUri=${var.key_vault_uri}secrets/${name}/)"
  }

  # action group id object for passing to node-app-service module
  bo_appeals_action_group_ids = {
    tech            = var.action_group_ids.bo_appeals_tech,
    service_manager = var.action_group_ids.bo_appeals_service_manager,
    iap             = var.action_group_ids.iap,
    its             = var.action_group_ids.its,
    info_sec        = var.action_group_ids.info_sec
  }

  # blob_storage_role_readwrite_custom_name = "Storage Blob Read Write (custom) - ${var.environment}"
}
