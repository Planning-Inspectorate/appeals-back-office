
resource "azurerm_virtual_network" "appeals_back_office_vnet1" {
  name                = "${local.org}-vnet1-${local.resource_suffix}"
  location            = module.azure_region.location
  resource_group_name = azurerm_resource_group.appeals_back_office_rg1.name
  address_space       = [var.vnet_address_space]

  tags = local.tags
}

resource "azurerm_subnet" "back_office_ingress" {
  name                                      = "${local.org}-subnet-ingress-${local.resource_suffix}"
  resource_group_name                       = azurerm_resource_group.appeals_back_office_rg1.name
  virtual_network_name                      = azurerm_virtual_network.appeals_back_office_vnet1.name
  address_prefixes                          = [var.vnet_address_space]
  private_endpoint_network_policies_enabled = true
}

# resource "azurerm_subnet" "back_office_subnets_storage_backend" {
#   name                                      = "${local.org}-subnet-be-${local.resource_suffix}"
#   resource_group_name                       = azurerm_resource_group.appeals_back_office_rg1.name
#   virtual_network_name                      = azurerm_virtual_network.appeals_back_office_vnet1.name
#   address_prefixes                          = [var.vnet_address_space]
#   private_endpoint_network_policies_enabled = true
# }

# resource "azurerm_subnet" "back_office_subnets_storage_frontend" {
#   name                                      = "${local.org}-subnet-fe-${local.resource_suffix}"
#   resource_group_name                       = azurerm_resource_group.appeals_back_office_rg1.name
#   virtual_network_name                      = azurerm_virtual_network.appeals_back_office_vnet1.name
#   address_prefixes                          = [var.vnet_address_space]
#   private_endpoint_network_policies_enabled = true
# }

# resource "azurerm_subnet" "back_office_subnets_management" {
#   name                                      = "${local.org}-subnet-man-${local.resource_suffix}"
#   resource_group_name                       = azurerm_resource_group.appeals_back_office_rg1.name
#   virtual_network_name                      = azurerm_virtual_network.appeals_back_office_vnet1.name
#   address_prefixes                          = [var.vnet_address_space]
#   private_endpoint_network_policies_enabled = true
# }
