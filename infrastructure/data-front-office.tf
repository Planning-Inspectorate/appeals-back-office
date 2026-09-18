# data blocks relating to Front Office resources

data "azurerm_virtual_network" "front_office_vnet" {
  # only include if configured to connect to front office
  count = var.front_office_infra_config.deploy_connections ? 1 : 0

  name                = var.front_office_infra_config.network.name
  resource_group_name = var.front_office_infra_config.network.rg
}

data "azurerm_storage_container" "front_office_documents" {
  # only include if configured to connect to front office
  count = var.front_office_infra_config.deploy_connections ? 1 : 0

  name = "uploads"

  # allow overriding the front-office subscription and storage account resource group
  storage_account_id = "${var.front_office_subscription_id != "" ?
  "/subscriptions/${var.front_office_subscription_id}" : data.azurerm_subscription.current.id}/resourceGroups/${var.front_office_storage_account_rg != "" ? var.front_office_storage_account_rg : var.front_office_infra_config.network.rg}/providers/Microsoft.Storage/storageAccounts/${replace("pinsstdocs${var.environment}ukw001", "-", "")}"
}
