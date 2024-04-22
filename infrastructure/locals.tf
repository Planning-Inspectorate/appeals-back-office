locals {
  org          = "pins"
  service_name = "appeals-back-office" # Or rename to "prj"?
  env          = "dev"
  location     = "uks"

  tags = merge(
    var.tags,
    {
      CreatedBy   = "Terraform"
      Environment = var.environment
      ServiceName = local.service_name
      env         = "dev"
      location    = "uksouth"
      test        = "appeals-back-office-test"
    }
  )

}
