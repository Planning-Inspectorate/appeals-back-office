locals {
  org          = "pins"
  service_name = "appeals-back-office"
  location     = "uksouth"

  resource_suffix = "${local.service_name}-${var.environment}-${module.azure_region.location_short}"

  tags = merge(
    var.tags,
    {
      CreatedBy   = "Terraform"
      Environment = var.environment
      ServiceName = local.service_name
      location    = local.location
    }
  )

}

#   location            = module.azure_region.location_cli
