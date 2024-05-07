data "azurerm_client_config" "current" {}

data "azurerm_subscription" "current" {}

data "azurerm_virtual_network" "tooling" {
  name                = var.tooling_config.network_name
  resource_group_name = var.tooling_config.network_rg

  provider = azurerm.tooling
}

data "azurerm_monitor_action_group" "tech" {
  resource_group_name = var.common_config.resource_group_name
  name                = var.common_config.action_group_names.tech
}
