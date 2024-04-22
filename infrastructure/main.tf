resource "azurerm_resource_group" "terraform_appeals_back_office" {
  name     = "${local.org}-rg-${local.resource_suffix}-001"
  location = local.region

  tags = local.tags
}

# Do we want to add a unique string to ensure each resource's name is unique?
