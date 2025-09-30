module "function_doc_processing" {
  #checkov:skip=CKV_TF_1: Use of commit hash are not required for our Terraform modules
  source = "github.com/Planning-Inspectorate/infrastructure-modules.git//modules/node-function-app?ref=1.50"

  resource_group_name = azurerm_resource_group.primary.name
  location            = module.primary_region.location

  # naming
  app_name        = "doc-processing"
  resource_suffix = var.environment
  service_name    = local.service_name
  tags            = local.tags

  # service plan
  app_service_plan_id = azurerm_service_plan.functions.id

  # storage
  function_apps_storage_account            = azurerm_storage_account.functions.name
  function_apps_storage_account_access_key = azurerm_storage_account.functions.primary_access_key

  # networking
  integration_subnet_id      = azurerm_subnet.apps.id
  outbound_vnet_connectivity = true

  # monitoring
  action_group_ids            = local.action_group_ids
  app_insights_instrument_key = azurerm_application_insights.main.instrumentation_key
  log_analytics_workspace_id  = azurerm_log_analytics_workspace.main.id
  monitoring_alerts_enabled   = var.alerts_enabled

  # settings
  function_node_version = var.apps_config.functions_node_version
  app_settings = {
    # Runtime env variables
    ServiceBusConnection__fullyQualifiedNamespace = local.service_bus_hostname
    # Function env variables
    API_HOST                = module.app_api.default_site_hostname
    BO_BLOB_CONTAINER       = azurerm_storage_container.appeal_documents.name
    BO_BLOB_STORAGE_ACCOUNT = azurerm_storage_account.documents.primary_blob_endpoint # TODO: replace with custom domain
  }
}

# subscriptions

resource "azurerm_servicebus_subscription" "document_to_move" {
  name                                 = "${azurerm_servicebus_topic.appeal_document_to_move.name}-bo-sub"
  topic_id                             = azurerm_servicebus_topic.appeal_document_to_move.id
  max_delivery_count                   = 1
  default_message_ttl                  = var.sb_ttl.bo_internal
  dead_lettering_on_message_expiration = true
}

resource "azurerm_eventgrid_event_subscription" "malware_scan_results" {
  name  = "malware-scan-results-subscription-${local.resource_suffix}"
  scope = azurerm_eventgrid_topic.document_scan_results.id

  azure_function_endpoint {
    function_id                       = "${module.function_doc_processing.app_id}/functions/malware-detection"
    max_events_per_batch              = 1
    preferred_batch_size_in_kilobytes = 64
  }
}

# RBAC for subscriptions

resource "azurerm_role_assignment" "document_to_move_sub_reciever" {
  scope                = azurerm_servicebus_subscription.document_to_move.id
  role_definition_name = "Azure Service Bus Data Receiver"
  principal_id         = module.function_doc_processing.principal_id
}

# RBAC for storage

resource "azurerm_role_assignment" "function_doc_processing_writer" {
  scope                = azurerm_storage_container.appeal_documents.resource_manager_id
  role_definition_name = "Storage Blob Data Contributor"
  principal_id         = module.function_doc_processing.principal_id
}

resource "azurerm_role_assignment" "function_doc_processing_front_office_reader" {
  # only include if configured to connect to front office
  count = var.front_office_infra_config.deploy_connections ? 1 : 0

  scope                = data.azurerm_storage_container.front_office_documents[0].resource_manager_id
  role_definition_name = "Storage Blob Data Reader"
  principal_id         = module.function_doc_processing.principal_id
}
