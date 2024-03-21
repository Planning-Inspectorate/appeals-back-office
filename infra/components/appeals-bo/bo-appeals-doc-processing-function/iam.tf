data "azurerm_storage_container" "fo_documents" {
  name                 = var.fo_appeals_document_container_name
  storage_account_name = replace("pinsstdocs${var.resource_suffix}", "-", "")
}

resource "azurerm_role_assignment" "function_blob_data_writer" {
  scope                = var.bo_appeals_document_container_id
  role_definition_name = "Storage Blob Data Contributor"
  principal_id         = module.bo_appeals_doc_processing_function.principal_id
}

resource "azurerm_role_assignment" "function_blob_data_reader" {
  scope                = data.azurerm_storage_container.fo_documents.resource_manager_id
  role_definition_name = "Storage Blob Data Reader"
  principal_id         = module.bo_appeals_doc_processing_function.principal_id
}

resource "azurerm_role_assignment" "service_bus_data_receiver_documents_to_move" {
  scope                = azurerm_servicebus_subscription.register_bo_document_to_move_subscription.id
  role_definition_name = "Azure Service Bus Data Receiver"
  principal_id         = module.bo_appeals_doc_processing_function.principal_id
}
