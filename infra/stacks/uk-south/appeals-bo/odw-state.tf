data "terraform_remote_state" "odw" {
  count = 0

  backend = "azurerm"

  config = {
    container_name       = "terraformstate-odw"
    resource_group_name  = "pins-rg-shared-terraform-uks"
    subscription_id      = "edb1ff78-90da-4901-a497-7e79f966f8e2"
    storage_account_name = "pinsstsharedtfstateuks"
    key                  = "${var.environment}.tfstate"
  }
}
