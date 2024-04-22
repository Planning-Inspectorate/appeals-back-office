locals {
  org          = "pins"
  service_name = "appeals-back-office"
  env          = "dev"
  location     = "uks"
  region       = "uksouth"

  tags = merge(
    var.tags,
    {
      CreatedBy   = "Terraform"
      Environment = var.environment
      ServiceName = local.service_name
      env         = local.env
      location    = local.location
    }
  )

}
