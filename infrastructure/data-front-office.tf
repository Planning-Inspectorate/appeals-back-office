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

  name                 = "uploads"
  storage_account_name = replace("pinsstdocs${var.environment}ukw001", "-", "")
}