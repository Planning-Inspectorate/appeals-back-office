# Put vars in alphabetical order a-z

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

variable "tags" {
  default     = {}
  description = "A collection of tags to assign to taggable resources"
  type        = map(string)
}

variable "vnet_address_space" {
  description = "The VNET address space"
  type        = string
}
