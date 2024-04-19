locals {
  org      = "pins"
  prj      = "appeals-back-office"
  env      = "dev"
  location = "uksouth"

  tags = merge(
    var.tags,
    {
      CreatedBy   = "Terraform"
      Environment = var.environment
      ServiceName = local.prj
      test        = "appeals-back-office-test"
    }
  )

}
