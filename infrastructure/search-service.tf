resource "azurerm_search_service" "appeals_search_service" {
  name                = "${local.org}-search-${local.shorter_resource_suffix}"
  resource_group_name = azurerm_resource_group.primary.name
  location            = module.primary_region.location
  sku                 = "free"
}
