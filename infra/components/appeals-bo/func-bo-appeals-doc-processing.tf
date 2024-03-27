module "bo_appeals_doc_processing_function" {
  source = "./bo-appeals-doc-processing-function"

  action_group_ids                                 = local.bo_appeals_action_group_ids
  location                                         = var.location
  log_analytics_workspace_id                       = var.log_analytics_workspace_id
  monitoring_alerts_enabled                        = var.monitoring_alerts_enabled
  resource_group_name                              = var.resource_group_name
  resource_suffix                                  = var.resource_suffix
  tags                                             = var.tags
  integration_subnet_id                            = var.back_office_integration_subnet_id
  function_apps_storage_account                    = var.shared_function_storage_name
  function_apps_storage_account_access_key         = var.shared_function_storage_primary_access_key
  back_office_api_host                             = module.app_service["back_office_appeals_api"].default_site_hostname
  app_service_plan_id                              = azurerm_service_plan.back_office_functions_plan.id
  service_bus_namespace_name                       = var.service_bus_namespace_name
  malware_scanning_topic_id                        = var.malware_scanning_topic_id
  bo_appeals_storage_account_endpoint              = var.bo_appeals_storage_account_endpoint
  bo_appeals_document_container_id                 = var.bo_appeals_document_container_id
  bo_appeals_document_container_name               = var.bo_appeals_document_container_name
  service_bus_appeals_bo_document_to_move_topic_id = var.service_bus_appeals_bo_document_to_move_topic_id
  service_bus_config                               = var.service_bus_config


  providers = {
    azurerm         = azurerm
    azurerm.tooling = azurerm.tooling
  }
}
