module "primary_region" {
  source  = "claranet/regions/azurerm"
  version = "7.1.1"

  azure_region = local.primary_location
}
