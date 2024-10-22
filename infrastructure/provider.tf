terraform {
  backend "azurerm" {
    subscription_id      = "edb1ff78-90da-4901-a497-7e79f966f8e2"
    resource_group_name  = "pins-rg-shared-terraform-uks"
    storage_account_name = "pinssttfstateuksappealbo"
    # per-environment key & container_name specified init step
  }

  required_providers {
    azurerm = {
      source                = "hashicorp/azurerm"
      version               = "=4.5.0"
      configuration_aliases = [azurerm, azurerm.tooling]
    }
  }
  required_version = ">= 1.1.6, < 1.10.0"
}

provider "azurerm" {
  features {}
}

provider "azurerm" {
  alias           = "tooling"
  subscription_id = var.tooling_config.subscription_id

  features {}
}

provider "azurerm" {
  alias                           = "horizon"
  subscription_id                 = var.horizon_infra_config.subscription_id
  resource_provider_registrations = "none"

  features {}
}
