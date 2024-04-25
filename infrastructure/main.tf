module "azure_region" {
  source  = "claranet/regions/azurerm"
  version = "7.1.1"

  azure_region = local.location
}

data "azurerm_client_config" "current" {}

resource "azurerm_resource_group" "appeals_back_office_rg1" {
  name     = "${local.org}-rg-${local.resource_suffix}-001"
  location = module.azure_region.location #.location_cli

  tags = local.tags
}

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


resource "azurerm_key_vault" "appeals_back_office_kv" {
  name                        = "${local.org}-appeals-bo-kv1"
  location                    = module.azure_region.location
  resource_group_name         = azurerm_resource_group.appeals_back_office_rg1.name
  enabled_for_disk_encryption = true
  tenant_id                   = data.azurerm_client_config.current.tenant_id
  soft_delete_retention_days  = 7
  purge_protection_enabled    = false

  sku_name = "standard"

  access_policy {
    tenant_id = data.azurerm_client_config.current.tenant_id
    object_id = data.azurerm_client_config.current.object_id

    key_permissions = [
      "Get",
    ]

    secret_permissions = [
      "Get",
    ]

    storage_permissions = [
      "Get",
    ]
  }
}

# Do we want to add a unique string to ensure each resource's name is unique?
# /24 is definitely enough ips?
# figure out exactly all the resources needed and how many of each
# Create a legal hold - for apply_blob_container_legal_hold; means we don't have to run a script and module - https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/storage_container
# resource "azurerm_storage_container" "my_container" {
#   name                  = "myblobcontainer"
#   storage_account_name  = azurerm_storage_account.my_account.name
#   container_access_type = "private"

#   legal_hold {
#     tags = ["litigation", "compliance"]
#   }
# }
# networks.tf & private-link-synapse need configuring - could be left to last as is just a private link + subnet currently
# secrets.tf not edited
# redis-cache.tf not edited
# monitoring.tf not edited
# databases.tf not edited
# service-bus not edited
# redis-cache - are all resources needed
