terraform {
  backend "azurerm" {
    container_name       = "terraformstate-appeals-back-office"
    resource_group_name  = "pins-rg-shared-terraform-uks"
    storage_account_name = "pinssttfstateuksappealsbackoffice"
    # key is set at init step
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
