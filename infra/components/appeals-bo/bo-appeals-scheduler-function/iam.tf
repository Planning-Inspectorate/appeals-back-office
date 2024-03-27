resource "azurerm_role_assignment" "function_blob_data_writer" {
  scope                = var.bo_appeals_document_container_id
  role_definition_name = "Storage Blob Data Contributor"
  principal_id         = module.bo_appeals_scheduler_function.principal_id
}
