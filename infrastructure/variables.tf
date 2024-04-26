# Put vars in alphabetical order a-z

# variable "action_group_names" {
#   description = "The names of the Azure Monitor action groups for different alert types"
#   type = object({
#     bo_appeals_tech                 = string,
#     bo_appeals_service_manager      = string,
#     bo_applications_tech            = string,
#     bo_applications_service_manager = string,
#     iap                             = string,
#     its                             = string,
#     info_sec                        = string
#   })
# }

variable "database_public_access_enabled" {
  description = "A switch indicating if databases should have public access enabled"
  type        = bool
  default     = false
}

variable "environment" {
  description = "The name of the environment in which resources will be deployed"
  type        = string
}

variable "key_vault_id" {
  description = "The ID of the key vault so the App Service can pull secret values"
  type        = string
}

variable "monitoring_alerts_enabled" {
  default     = false
  description = "Indicates whether Azure Monitor alerts are enabled for App Service"
  type        = bool
}

variable "sql_database_configuration" {
  description = "A map of database configuration options"
  type        = map(string)
}

variable "sql_server_azuread_administrator" {
  description = "A map describing the AzureAD account used for the SQL server administrator"
  type        = map(string)
}

variable "tags" {
  default     = {}
  description = "A collection of tags to assign to taggable resources"
  type        = map(string)
}

variable "vnet_address_space" {
  description = "The VNET address space"
  type        = string
}
