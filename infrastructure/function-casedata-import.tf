module "function_casedata_import" {
  #checkov:skip=CKV_TF_1: Use of commit hash are not required for our Terraform modules
  source = "github.com/Planning-Inspectorate/infrastructure-modules.git//modules/node-function-app?ref=1.49"

  resource_group_name = azurerm_resource_group.primary.name
  location            = module.primary_region.location

  # naming
  app_name        = "casedata-import"
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
    API_HOST = module.app_api.default_site_hostname
  }
}

# Service Bus subscriptions

resource "azurerm_servicebus_subscription" "fo_appellant_submission" {
  name                                 = "${azurerm_servicebus_topic.appeal_fo_appellant_submission.name}-bo-sub"
  topic_id                             = azurerm_servicebus_topic.appeal_fo_appellant_submission.id
  max_delivery_count                   = 1
  default_message_ttl                  = var.sb_ttl.bo_sub
  dead_lettering_on_message_expiration = true
}

resource "azurerm_servicebus_subscription" "fo_lpa_questionnaire" {
  name                                 = "${azurerm_servicebus_topic.appeal_fo_lpa_questionnaire_submission.name}-bo-sub"
  topic_id                             = azurerm_servicebus_topic.appeal_fo_lpa_questionnaire_submission.id
  max_delivery_count                   = 1
  default_message_ttl                  = var.sb_ttl.bo_sub
  dead_lettering_on_message_expiration = true
}

resource "azurerm_servicebus_subscription" "fo_representation_submission" {
  name                                 = "${azurerm_servicebus_topic.appeal_fo_representation_submission.name}-bo-sub"
  topic_id                             = azurerm_servicebus_topic.appeal_fo_representation_submission.id
  max_delivery_count                   = 1
  default_message_ttl                  = var.sb_ttl.bo_sub
  dead_lettering_on_message_expiration = true
}

# RBAC for subscriptions

resource "azurerm_role_assignment" "fo_appellant_submission_sub_reciever" {
  scope                = azurerm_servicebus_subscription.fo_appellant_submission.id
  role_definition_name = "Azure Service Bus Data Receiver"
  principal_id         = module.function_casedata_import.principal_id
}

resource "azurerm_role_assignment" "fo_lpa_questionnaire_sub_reciever" {
  scope                = azurerm_servicebus_subscription.fo_lpa_questionnaire.id
  role_definition_name = "Azure Service Bus Data Receiver"
  principal_id         = module.function_casedata_import.principal_id
}

resource "azurerm_role_assignment" "fo_representation_submission_sub_reciever" {
  scope                = azurerm_servicebus_subscription.fo_representation_submission.id
  role_definition_name = "Azure Service Bus Data Receiver"
  principal_id         = module.function_casedata_import.principal_id
}
