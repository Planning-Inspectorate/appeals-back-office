locals {
  org                = "pins"
  service_name       = "appeals-bo"
  primary_location   = "uk-south"
  secondary_location = "uk-west"

  resource_suffix           = "${local.service_name}-${var.environment}"
  secondary_resource_suffix = "${local.service_name}-secondary-${var.environment}"

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

  tech_emails = [for rec in data.azurerm_monitor_action_group.tech.email_receiver : rec.email_address]
}
