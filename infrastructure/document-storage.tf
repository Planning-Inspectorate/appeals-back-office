resource "azurerm_storage_account" "documents" {
  #TODO: Customer Managed Keys
  #checkov:skip=CKV2_AZURE_1: Customer Managed Keys not implemented yet
  #checkov:skip=CKV2_AZURE_18: Customer Managed Keys not implemented yet
  #TODO: Logging
  #checkov:skip=CKV_AZURE_33: Logging not implemented yet
  #checkov:skip=CKV2_AZURE_8: Logging not implemented yet
  #TODO: Access restrictions
  #checkov:skip=CKV_AZURE_35: Network access restrictions
  #checkov:skip=CKV_AZURE_59: TODO: Ensure that Storage accounts disallow public access
  #checkov:skip=CKV_AZURE_190: TODO: Ensure that Storage blobs restrict public access
  name                             = "pinsstdocsappealsbo${local.environment}" # env training will shorten from training to train so doc storage account name length is 24 chars
  resource_group_name              = azurerm_resource_group.primary.name
  location                         = module.primary_region.location
  account_tier                     = "Standard"
  account_replication_type         = var.documents_config.account_replication_type
  allow_nested_items_to_be_public  = true
  cross_tenant_replication_enabled = false
  enable_https_traffic_only        = true
  min_tls_version                  = "TLS1_2"

  tags = local.tags

  blob_properties {
    cors_rule {
      allowed_headers    = ["*"]
      allowed_methods    = ["GET", "OPTIONS", "PUT", "DELETE"]
      allowed_origins    = lookup(local.allowed_origins, var.environment, local.allowed_origins["default"])
      exposed_headers    = ["*"]
      max_age_in_seconds = "600"
    }
  }
}

locals {
  allowed_origins_azure = ["https://${var.web_app_domain}"]
  allowed_origins_local = ["https://localhost:8080"]
  allowed_origins = {
    dev     = concat(local.allowed_origins_azure, local.allowed_origins_local),
    default = local.allowed_origins_azure
  }
}

resource "azurerm_storage_container" "appeal_documents" {
  #TODO: Logging
  #checkov:skip=CKV2_AZURE_21 Logging not implemented yet
  name                  = "appeals-bo-documents"
  storage_account_name  = azurerm_storage_account.documents.name
  container_access_type = "private"
}


## Event Grid topic for malware scan results
resource "azurerm_eventgrid_topic" "document_scan_results" {
  #checkov:skip=CKV_AZURE_192: TODO: Ensure that Azure Event Grid Topic local Authentication is disabled
  #checkov:skip=CKV_AZURE_193: TODO: Ensure public network access is disabled for Azure Event Grid Topic
  name                = "malware-scan-results-${local.resource_suffix}"
  resource_group_name = azurerm_resource_group.primary.name
  location            = module.primary_region.location

  identity {
    type = "SystemAssigned"
  }
}

## Setup the storage account to send scan results to the custom topic
resource "azurerm_resource_group_template_deployment" "document_storage_malware_scanning_settings" {
  name                = "malware-scan-settings"
  resource_group_name = azurerm_resource_group.primary.name
  deployment_mode     = "Incremental"
  template_content    = <<EOT
  {
    "$schema": "https://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#",
    "contentVersion": "1.0.0.0",
    "parameters": {
      "storage_account_id": {
        "type": "string"
      },
      "subscription_id": {
        "type": "string"
      },
      "resource_group": {
        "type": "string"
      },
      "event_grid_topicId": {
        "type": "string"
      },
      "cap_gb_per_month": {
        "type": "int"
      }
    },
    "resources": [
      {
        "type": "Microsoft.Security/DefenderForStorageSettings",
        "apiVersion": "2022-12-01-preview",
        "name": "current",
        "properties": {
          "isEnabled": true,
          "malwareScanning": {
            "onUpload": {
              "isEnabled": true,
              "capGBPerMonth": "[parameters('cap_gb_per_month')]"
            },
            "scanResultsEventGridTopicResourceId": "[parameters('event_grid_topicId')]"
          },
          "sensitiveDataDiscovery": {
            "isEnabled": false
          },
          "overrideSubscriptionLevelSettings": true
        },
        "scope": "[parameters('storage_account_id')]"
      }
    ],
    "outputs": {}
  }
  EOT

  parameters_content = jsonencode({
    "storage_account_id" = {
      value = azurerm_storage_account.documents.id
    }
    "subscription_id" = {
      value = data.azurerm_subscription.current.id
    }
    "resource_group" = {
      value = azurerm_resource_group.primary.name
    }
    "event_grid_topicId" = {
      value = azurerm_eventgrid_topic.document_scan_results.id
    }
    "cap_gb_per_month" = {
      value = 5000
    }
  })
}

## RBAC for Entra Groups
# role definitions
data "azurerm_role_definition" "custom_blob_role" {
  name  = "Storage Blob Data - Read Write Delete (custom)"
  scope = data.azurerm_subscription.current.id
}

# read/write access
resource "azurerm_role_assignment" "case_officer_documents_access" {
  scope              = azurerm_storage_container.appeal_documents.resource_manager_id
  role_definition_id = data.azurerm_role_definition.custom_blob_role.role_definition_id
  principal_id       = var.apps_config.auth.group_ids.case_officer
}

resource "azurerm_role_assignment" "inspector_documents_access" {
  scope              = azurerm_storage_container.appeal_documents.resource_manager_id
  role_definition_id = data.azurerm_role_definition.custom_blob_role.role_definition_id
  principal_id       = var.apps_config.auth.group_ids.inspector
}

# read only access
resource "azurerm_role_assignment" "cs_team_documents_access" {
  scope                = azurerm_storage_container.appeal_documents.resource_manager_id
  role_definition_name = "Storage Blob Data Reader"
  principal_id         = var.apps_config.auth.group_ids.cs_team
}

resource "azurerm_role_assignment" "legal_documents_access" {
  scope                = azurerm_storage_container.appeal_documents.resource_manager_id
  role_definition_name = "Storage Blob Data Reader"
  principal_id         = var.apps_config.auth.group_ids.legal
}

resource "azurerm_role_assignment" "api_document_validation" {
  scope                = azurerm_storage_container.appeal_documents.resource_manager_id
  role_definition_name = "Storage Blob Data Reader"
  principal_id         = module.app_api.principal_id
}
