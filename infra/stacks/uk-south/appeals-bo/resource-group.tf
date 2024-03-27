resource "azurerm_resource_group" "back_office_stack" {
  name     = "pins-rg-${local.service_name}-${local.resource_suffix}"
  location = module.azure_region_ukw.location

  tags = local.tags
}
