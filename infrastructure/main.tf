module "azure_region" {
  source  = "claranet/regions/azurerm"
  version = "7.1.1"

  azure_region = local.location
}

resource "azurerm_resource_group" "appeals_back_office_rg1" {
  name     = "${local.org}-rg-${local.resource_suffix}-001"
  location = module.azure_region #.location_cli

  tags = local.tags
}

resource "azurerm_virtual_network" "appeals_back_office_vnet1" {
  name                = "${local.org}-vnet1-${local.resource_suffix}"
  location            = module.azure_region.location
  resource_group_name = azurerm_resource_group.appeals_back_office_rg1.name
  address_space       = [var.vnet_address_space]

  #   name           = "integration_subnet"
  #   address_prefix = "10.0.1.0/24" # use these as var references? find our the range and spin them and figure rest out later
  # }

  # subnet {
  #   name           = "endpoint_subnet"
  #   address_prefix = "10.0.2.0/24"
  # }

  tags = local.tags
}

# Do we want to add a unique string to ensure each resource's name is unique?
# /24 is definitely enough ips?
