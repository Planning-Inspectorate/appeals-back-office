resource "azurerm_service_plan" "functions" {
  #checkov:skip=CKV_AZURE_212: TODO: Ensure App Service has a minimum number of instances for failover
  #checkov:skip=CKV_AZURE_225: TODO: Ensure the App Service Plan is zone redundant
  name                = "${local.org}-asp-${local.service_name}-funcs-${var.environment}"
  resource_group_name = azurerm_resource_group.primary.name
  location            = module.primary_region.location

  os_type  = "Linux"
  sku_name = var.apps_config.functions_service_plan_sku

  tags = local.tags
}

resource "azurerm_storage_account" "functions" {
  #TODO: Customer Managed Keys
  #checkov:skip=CKV2_AZURE_1: Customer Managed Keys not implemented yet
  #checkov:skip=CKV2_AZURE_18: Customer Managed Keys not implemented yet
  #TODO: Logging
  #checkov:skip=CKV_AZURE_33: Logging not implemented yet
  #checkov:skip=CKV2_AZURE_8: Logging not implemented yet
  #TODO: Access restrictions
  #checkov:skip=CKV_AZURE_35: Network access restrictions
  #checkov:skip=CKV_AZURE_59: TODO: Ensure that Storage accounts disallow public access
  #checkov:skip=CKV_AZURE_206: TODO: Ensure that Storage Accounts use replication

  name                             = "pinsstfuncappealsbo${local.environment}" # local will shorten training to train so storage account name length is =< 24 chars
  resource_group_name              = azurerm_resource_group.primary.name
  location                         = module.primary_region.location
  account_tier                     = "Standard"
  account_replication_type         = "GRS"
  allow_nested_items_to_be_public  = false
  cross_tenant_replication_enabled = false
  https_traffic_only_enabled       = true
  min_tls_version                  = "TLS1_2"

  tags = local.tags
}
