# Spin up after databases.tf


# locals {
#   allowed_origins_prod  = [var.back_office_public_url_new != null ? "https://${var.back_office_public_url_new}" : "", "https://${var.back_office_appeals_public_url}"]
#   allowed_origins_live  = ["https://${var.back_office_public_url}", "https://${var.back_office_appeals_public_url}"]
#   allowed_origins_local = ["https://localhost:8080"]
#   allowed_origins = {
#     dev     = concat(local.allowed_origins_live, local.allowed_origins_local),
#     test    = local.allowed_origins_live
#     prod    = local.allowed_origins_prod
#     default = local.allowed_origins_live
#   }
# }

# resource "azurerm_storage_account" "back_office_documents" {
#   name                             = replace("pinsstdocsbo${local.resource_suffix}", "-", "") # going to have to be unique name
#   resource_group_name              = azurerm_resource_group.appeals_back_office_rg1.name
#   location                         = module.azure_region.location
#   account_tier                     = "Standard"
#   account_replication_type         = "GRS"
#   allow_nested_items_to_be_public  = true
#   cross_tenant_replication_enabled = false
#   enable_https_traffic_only        = true
#   min_tls_version                  = "TLS1_2"

#   tags                             = local.tags

#   blob_properties {
#     cors_rule {
#       allowed_headers    = ["*"]
#       allowed_methods    = ["GET", "OPTIONS", "PUT"]
#       allowed_origins    = lookup(local.allowed_origins, var.environment, local.allowed_origins["default"])
#       exposed_headers    = ["*"]
#       max_age_in_seconds = "600"
#     }
#   }
# }

# resource "azurerm_eventgrid_system_topic" "back_office_documents_system_topic" {
#   name                = "upload-blob-events"
#   resource_group_name = azurerm_resource_group.appeals_back_office_rg1.name
#   location            = module.azure_region.location
#   # The resource ID can only be scoped to the storage account, not the container. Container filtering is done on the subscription.
#   source_arm_resource_id = azurerm_storage_account.back_office_documents.id
#   topic_type             = "Microsoft.Storage.StorageAccounts"
# }

# # Temporary storage for documents from front office before they're submitted
# resource "azurerm_storage_container" "back_office_submissions_container" {
#   name                  = "application-submission-documents"
#   storage_account_name  = azurerm_storage_account.back_office_documents.name
#   container_access_type = "private"
# }

# # TODO: Separate containers for Applications and Appeals? We won't need to assign permissions to the appeals wfe, just to the appeals group
# # Need to look into what could be separated
# resource "azurerm_storage_container" "back_office_document_service_uploads_container" {
#   name                  = "document-service-uploads"
#   storage_account_name  = azurerm_storage_account.back_office_documents.name
#   container_access_type = "private"
# }

# resource "azurerm_storage_container" "back_office_published_documents_container" {
#   name                  = "published-documents"
#   storage_account_name  = azurerm_storage_account.back_office_documents.name
#   container_access_type = "blob"
# }

# resource "azurerm_storage_container" "back_office_appeals_document_container" {
#   name                  = "bo-appeals-documents"
#   storage_account_name  = azurerm_storage_account.back_office_documents.name
#   container_access_type = "private"
# }

# # Shared storage between back office appps for Azure Functions ------ not sure what this is
# resource "azurerm_storage_account" "function_storage" {

#   name                             = replace("pinsfuncbo${local.resource_suffix}", "-", "")
#   resource_group_name              = azurerm_resource_group.appeals_back_office_rg1.name
#   location                         = module.azure_region.location
#   account_tier                     = "Standard"
#   account_replication_type         = "GRS"
#   allow_nested_items_to_be_public  = false
#   cross_tenant_replication_enabled = false
#   enable_https_traffic_only        = true
#   min_tls_version                  = "TLS1_2"

#   tags = local.tags
# }

# module "apply_blob_container_legal_hold" {
#   blob_store_account_container_pairs = [
#     {
#       blob_account_name : azurerm_storage_account.back_office_documents.name,
#       blob_container_name : azurerm_storage_container.back_office_document_service_uploads_container.name
#     }
#   ]
#   # depends_on property guarantees that the containers and account exists before the script runs
#   # Should this be private
#   depends_on = [
#     azurerm_storage_account.back_office_documents,
#     azurerm_storage_container.back_office_document_service_uploads_container
#   ]
#   # legal_hold_tags = ["LegalHold"] - original code
#   legal_hold {
#     tags = ["LegalHold"]
#   }
#   source          = "../components/apply-blob-container-legal-hold"
# }

# # Variables
# variable "back_office_public_url_new" {
#   description = "The new public URL for the Back Office frontend web app"
#   type        = string
#   default     = null
# }

# variable "back_office_appeals_public_url" {
#   description = "The public URL for the Back Office Appeals frontend web app"
#   type        = string
# }

# variable "back_office_public_url" {
#   description = "The public URL for the Back Office frontend web app"
#   type        = string
# }
