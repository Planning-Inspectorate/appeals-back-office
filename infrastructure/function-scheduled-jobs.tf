module "function_scheduled_jobs" {
  #checkov:skip=CKV_TF_1: Use of commit hash are not required for our Terraform modules
  source = "github.com/Planning-Inspectorate/infrastructure-modules.git//modules/node-function-app?ref=1.48"

  resource_group_name = azurerm_resource_group.primary.name
  location            = module.primary_region.location

  # naming
  app_name        = "scheduled-jobs"
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

# RBAC for documents
resource "azurerm_role_assignment" "function_scheduled_jobs_writer" {
  scope                = azurerm_storage_container.appeal_documents.resource_manager_id
  role_definition_name = "Storage Blob Data Contributor"
  principal_id         = module.function_scheduled_jobs.principal_id
}
