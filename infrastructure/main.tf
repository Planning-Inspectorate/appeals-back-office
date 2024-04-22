resource "azurerm_resource_group" "terraform_boa_test" {
  name     = "${local.org}-rg-${local.service_name}-${local.env}-${local.location}-001"
  location = local.region

  tags = local.tags
}

# Do we want to add a unique string to ensure each resource's name is unique?
