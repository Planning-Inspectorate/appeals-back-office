locals {
  org              = "pins"
  service_name     = "appeals-bo"
  primary_location = "uk-south"

  resource_suffix = "${local.service_name}-${var.environment}"

  secrets = [
    "appeals-bo-client-secret",
    "appeals-bo-gov-notify-api-key",
    "appeals-bo-test-mailbox"
  ]

  tags = merge(
    var.tags,
    {
      CreatedBy   = "Terraform"
      Environment = var.environment
      ServiceName = local.service_name
      location    = local.primary_location
    }
  )
}