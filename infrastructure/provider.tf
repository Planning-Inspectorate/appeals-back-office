terraform {
  backend "azurerm" {
    subscription_id      = "edb1ff78-90da-4901-a497-7e79f966f8e2"
    resource_group_name  = "pins-rg-shared-terraform-uks"
    storage_account_name = "pinssttfstateuksappealsbackoffice"
    # per-environment key & container_name specified init step
  }

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.99.0"
    }
  }
  required_version = ">= 1.1.6, < 3.99.0"
}

provider "azurerm" {
  features {}
}

module "azure_region" {
  source  = "claranet/regions/azurerm"
  version = "7.1.1"

  azure_region = local.location
}

data "azurerm_client_config" "current" {}
