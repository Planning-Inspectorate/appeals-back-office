module "bo_appeals_casedata_import_function" {
  #checkov:skip=CKV_TF_1: Use of commit hash are not required for our Terraform modules
  source = "github.com/Planning-Inspectorate/infrastructure-modules.git//modules/node-function-app?ref=1.16"

  action_group_ids                         = var.action_group_ids
  app_name                                 = "casedata-import"
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
  use_app_insights                         = false
  function_node_version                    = 18

  app_settings = {
    # Runtime env variables
    ServiceBusConnection__fullyQualifiedNamespace = "${var.service_bus_namespace_name}.servicebus.windows.net"
    # Function env variables
    API_HOST = var.back_office_api_host
  }

  tags = var.tags
}

resource "azurerm_servicebus_subscription" "fo_appellant_submission_subscription" {
  name                                 = "fo-appellant-submission-subscription"
  topic_id                             = var.service_bus_appeals_fo_appellant_submission_id
  max_delivery_count                   = 1
  default_message_ttl                  = var.service_bus_config.bo_subscription_ttl
  dead_lettering_on_message_expiration = true
}

resource "azurerm_servicebus_subscription" "fo_lpaq_submission_subscription" {
  name                                 = "fo-lpaq-submission-subscription"
  topic_id                             = var.service_bus_appeals_fo_lpa_response_submission_id
  max_delivery_count                   = 1
  default_message_ttl                  = var.service_bus_config.bo_subscription_ttl
  dead_lettering_on_message_expiration = true
}
