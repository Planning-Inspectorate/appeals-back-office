data "azurerm_client_config" "current" {}

data "azurerm_subscription" "current" {}

data "azurerm_virtual_network" "tooling" {
  name                = var.tooling_config.network_name
  resource_group_name = var.tooling_config.network_rg

  provider = azurerm.tooling
}

data "azurerm_virtual_network" "vnet_primary_test" {
  count               = var.environment == "staging" ? 1 : 0
  name                = var.service_bus_shared.network_name
  resource_group_name = var.service_bus_shared.resource_group_name
}

# these are owned by the "common" stack in the infrastructure-environments repo
# https://github.com/Planning-Inspectorate/infrastructure-environments/blob/main/app/stacks/uk-west/common/action-group.tf
data "azurerm_monitor_action_group" "common" {
  for_each = tomap(var.common_config.action_group_names)

  resource_group_name = var.common_config.resource_group_name
  name                = each.value
}

data "azurerm_cdn_frontdoor_profile" "shared" {
  name                = var.front_door_config.name
  resource_group_name = var.front_door_config.rg
  provider            = azurerm.front_door
}

data "azurerm_cdn_frontdoor_endpoint" "shared" {
  name                = var.front_door_config.ep_name
  resource_group_name = var.front_door_config.rg
  profile_name        = var.front_door_config.name
  provider            = azurerm.front_door
}
