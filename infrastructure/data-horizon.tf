# data blocks relating to Horizon (legacy) resources

data "azurerm_virtual_network" "horizon_vnet" {
  # only include if configured to connect to horizon
  count = var.horizon_infra_config.deploy_connections ? 1 : 0

  name                = var.horizon_infra_config.network.name
  resource_group_name = var.horizon_infra_config.network.rg

  provider = azurerm.horizon
}
