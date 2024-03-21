module "bo_appeals_doc_processing_function" {
  #checkov:skip=CKV_TF_1: Use of commit hash are not required for our Terraform modules
  source = "github.com/Planning-Inspectorate/infrastructure-modules.git//modules/node-function-app?ref=1.16"

  action_group_ids                         = var.action_group_ids
  app_name                                 = "doc-processing"
  app_service_plan_id                      = var.app_service_plan_id
  function_apps_storage_account            = var.function_apps_storage_account
  function_apps_storage_account_access_key = var.function_apps_storage_account_access_key
  integration_subnet_id                    = var.integration_subnet_id
  location                                 = var.location
  log_analytics_workspace_id               = var.log_analytics_workspace_id
  monitoring_alerts_enabled                = var.monitoring_alerts_enabled
  outbound_vnet_connectivity               = true
  resource_group_name                      = var.resource_group_name
  resource_suffix                          = var.resource_suffix
  service_name                             = "bo-appeals"
  use_app_insights                         = true
  function_node_version                    = 18

  app_settings = {
    # Runtime env variables
    ServiceBusConnection__fullyQualifiedNamespace = "${var.service_bus_namespace_name}.servicebus.windows.net"
    # Function env variables
    API_HOST                = var.back_office_api_host
    BO_BLOB_STORAGE_ACCOUNT = var.bo_appeals_storage_account_endpoint
    BO_BLOB_CONTAINER       = var.bo_appeals_document_container_name
  }

  tags = var.tags
}

resource "azurerm_servicebus_subscription" "register_bo_document_to_move_subscription" {
  name                                 = "appeal-document-to-move-subscription"
  topic_id                             = var.service_bus_appeals_bo_document_to_move_topic_id
  max_delivery_count                   = 1
  default_message_ttl                  = var.service_bus_config.bo_internal_subscription_ttl
  dead_lettering_on_message_expiration = true
}
