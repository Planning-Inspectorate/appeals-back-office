locals {
  org         = "pins"
  ServiceName = "appeals-back-office" # Or rename to "prj"?
  env         = "dev"
  location    = "uks"

  tags = merge(
    var.tags,
    {
      CreatedBy   = "Terraform"
      Environment = var.environment
      ServiceName = local.ServiceName
      env         = "dev"
      location    = "uksouth"
      test        = "appeals-back-office-test"
    }
  )

}
