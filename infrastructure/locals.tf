locals {
  org          = "pins"
  service_name = "appeals-back-office"
  env          = "dev"
  region       = "uksouth"

  resource_suffix = "${local.service_name}-${var.environment}-${module.azure_region.location_short}"

  tags = merge(
    var.tags,
    {
      CreatedBy   = "Terraform"
      Environment = var.environment
      ServiceName = local.service_name
      env         = local.env
      location    = var.location
    }
  )

}

#   location            = module.azure_region.location_cli
