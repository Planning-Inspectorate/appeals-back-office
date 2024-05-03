# variables should be sorted A-Z

variable "environment" {
  description = "The name of the environment in which resources will be deployed"
  type        = string
}

variable "tags" {
  description = "A collection of tags to assign to taggable resources"
  type        = map(string)
  default     = {}
}

variable "tooling_config" {
  description = "Config for the tooling subscription resources"
  type = object({
    network_name    = string
    network_rg      = string
    subscription_id = string
  })
}

variable "vnet_address_space" {
  description = "The main VNET address space in CIDR notation"
  type        = string
}

variable "vnet_main_subnet_address_space" {
  description = "The main subnet address space in CIDR notation"
  type        = string
}