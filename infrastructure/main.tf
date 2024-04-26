
resource "azurerm_resource_group" "appeals_back_office_rg1" {
  name     = "${local.org}-rg-${local.resource_suffix}-001"
  location = module.azure_region.location #.location_cli

  tags = local.tags
}

# Do we want to add a unique string to ensure each resource's name is unique?
# /24 is definitely enough IPs? - 251 ips
# Create a legal hold - for apply_blob_container_legal_hold; means we don't have to run a script and module - https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/storage_container
# resource "azurerm_storage_container" "my_container" {
#   name                  = "myblobcontainer"
#   storage_account_name  = azurerm_storage_account.my_account.name
#   container_access_type = "private"

#   legal_hold {
#     tags = ["litigation", "compliance"]
#   }
# }

# Do we need a FE, BE, Management subnets? How many IPs are needed for each one?, dbs, webservers, storage accounts,
