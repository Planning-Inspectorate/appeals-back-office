resource "azurerm_role_assignment" "appeals_case_officer_documents_access" {
  scope                = var.bo_appeals_document_container_id
  role_definition_name = "Storage Blob Data Contributor"
  principal_id         = var.azuread_appeals_case_officer_group_id
}

resource "azurerm_role_assignment" "appeals_inspector_documents_access" {
  scope                = var.bo_appeals_document_container_id
  role_definition_name = "Storage Blob Data Contributor"
  principal_id         = var.azuread_appeals_inspector_group_id
}

resource "azurerm_role_assignment" "back_office_app_send_event_grid" {
  scope                = var.malware_scanning_topic_id
  role_definition_name = "EventGrid Data Sender"
  principal_id         = module.app_service["back_office_api"].principal_id
}

# As above, assume appeals will choose its own topics to publish to on the same service bus instance
resource "azurerm_role_assignment" "back_office_appeals_send_service_bus_access" {
  scope                = var.service_bus_namespace_id
  role_definition_name = "Azure Service Bus Data Sender"
  principal_id         = module.app_service["back_office_appeals_api"].principal_id
}
