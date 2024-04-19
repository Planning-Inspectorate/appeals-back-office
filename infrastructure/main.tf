resource "azurerm_resource_group" "terraform_boa_test" {
  name     = "${local.org}-rg-${local.prj}-${local.env}-${local.location}-001"
  location = local.location

  tags = local.tags
}

# Do we want to add a unique string to ensure each resource's name is unique
