terraform {
  backend "azurerm" {
    subscription_id      = "edb1ff78-90da-4901-a497-7e79f966f8e2"
    resource_group_name  = "pins-rg-shared-terraform-uks"
    storage_account_name = "pinssttfstateuksappealbo"
    # per-environment key & container_name specified init step
  }

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "=4.8.0"
    }
    random = {
      source  = "hashicorp/random"
      version = ">= 3.6.3"
    }
  }
  required_version = ">= 1.1.6, < 1.10.0"
}

provider "azurerm" {
  features {}
}

provider "azurerm" {
  alias           = "tooling"
<<<<<<< HEAD
  subscription_id = var.front_door_config.subscription_id

<<<<<<< HEAD
  features {}
}

provider "azurerm" {
  # either tooling or prod for shared FD instance
  alias           = "front_door"
  subscription_id = var.front_door_config.use_tooling == true ? var.tooling_config.subscription_id : null

=======
>>>>>>> c2ef09409 (test(tooling): Adding FrontDoor tooling)
=======
  subscription_id = var.tooling_config.subscription_id

>>>>>>> cba86a98c (test(tooling): Adding FrontDoor tooling)
  features {}
}

provider "azurerm" {
  alias                           = "horizon"
  subscription_id                 = var.horizon_infra_config.subscription_id
  resource_provider_registrations = "none"
  features {}
}
