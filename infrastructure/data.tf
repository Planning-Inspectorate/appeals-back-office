data "azurerm_monitor_action_group" "bo_appeals_tech" {
  resource_group_name = azurerm_resource_group.appeals_back_office_rg1.name
  name                = var.action_group_names.bo_appeals_tech
}
