# Common variables, reused across app services

variable "environment" {
  description = "The environment resources are deployed to e.g. 'dev'"
  type        = string
}

variable "service_name" {
  description = "The name of the service the Azure App Services are part of"
  type        = string
}

variable "resource_suffix" {
  description = "The suffix for resource naming"
  type        = string
}

variable "common_resource_group_name" {
  description = "The common infrastructure resource group name"
  type        = string
}

variable "common_tags" {
  description = "The common resource tags for the project"
  type        = map(string)
}

variable "app_service_plan_id" {
  description = "The id of the app service plan"
  type        = string
}

variable "location" {
  description = "The location resources are deployed to in slug format e.g. 'uk-south'"
  type        = string
  default     = "uk-south"
}

variable "node_port" {
  description = "The port used to serve this app service"
  sensitive   = true
  type        = string
}

variable "node_environment" {
  description = "The env settings the node app runs as"
  sensitive   = true
  type        = string
}

variable "node_log_level_file" {
  description = "The log level used by this app service when writing logs"
  sensitive   = true
  type        = string
}

variable "node_log_level_stdout" {
  description = "The log level used by this app service when outputting to the console"
  sensitive   = true
  type        = string
}

variable "health_check_path" {
  description = "The path of the service's health check endpoint"
  type        = string
  default     = "/health"
}

variable "instance" {
  description = "The environment instance for use if multiple environments are deployed to a subscription"
  type        = string
  default     = "001"
}

variable "action_group_ids" {
  description = "The IDs of the Azure Monitor action groups for different alert types"
  type = object({
    bo_appeals_tech            = string,
    bo_appeals_service_manager = string,
    iap                        = string,
    its                        = string,
    info_sec                   = string
  })
}

variable "action_group_ids_map" {
  description = "All the Azure Monitor action group IDs"
  type        = map(string)
}

# variable "action_group_names" {
#   description = "The names of the Azure Monitor action groups for different alert types"
#   type = object({
#     bo_appeals_tech            = string,
#     bo_appeals_service_manager = string,
#     iap                        = string,
#     its                        = string,
#     info_sec                   = string
#   })
# }

# Resources

variable "key_vault_id" {
  description = "The ID of the key vault so the App Service can pull secret values"
  type        = string
}

variable "key_vault_uri" {
  description = "The URI of the Key Vault"
  type        = string
}

variable "container_registry_name" {
  description = "The name of the container registry that hosts the image"
  type        = string
}

variable "container_registry_rg" {
  description = "The resource group of the container registry that hosts the image"
  type        = string
}

variable "service_bus_namespace_name" {
  description = "The name of the Back Office service bus namespace"
  type        = string
}

# Network settings

variable "common_vnet_id" {
  description = "The common infrastructure virtual network id"
  type        = string
}

variable "common_vnet_cidr_blocks" {
  description = "A map of IP address blocks from the subnet name to the allocated CIDR prefix"
  type        = map(string)
}

variable "common_vnet_gateway_id" {
  description = "The id of the common infrastructure virtual network gateway"
  type        = string
}

variable "common_vnet_name" {
  description = "The common infrastructure virtual network name"
  type        = string
}

variable "app_service_private_dns_zone_id" {
  description = "The id of the private DNS zone for App services"
  type        = string
}

variable "integration_subnet_id" {
  description = "The id of the vnet integration subnet the app service is linked to for egress traffic"
  type        = string
}

variable "endpoint_subnet_id" {
  description = "The id of the private endpoint subnet the app service is linked to for ingress traffic"
  type        = string
}

variable "private_endpoint_enabled" {
  description = "A switch to determine if Private Endpoint should be enabled for backend App Services"
  type        = bool
  default     = true
}

# Entra variables, group IDs and OIDC settings

variable "azuread_auth_client_id" {
  description = "The Back Office web frontend app registration ID used for Azure AD authentication"
  type        = string
  default     = null
}

variable "azuread_appeals_case_officer_group_id" {
  description = "The AD group ID for Appeals BO case officers"
  type        = string
  default     = null
}

variable "azuread_appeals_inspector_group_id" {
  description = "The AD group ID for Appeals BO inspectors"
  type        = string
  default     = null
}

variable "azuread_appeals_cs_team_group_id" {
  description = "The AD group ID for Appeals BO customer services"
  type        = string
  default     = null
}

variable "azuread_appeals_legal_team_group_id" {
  description = "The AD group ID for Appeals BO legal services"
  type        = string
  default     = null
}

variable "azuread_appeals_pads_group_id" {
  description = "The AD group ID for Appeals BO PADS"
  type        = string
  default     = null
}

variable "azuread_appeals_readonly_group_id" {
  description = "The AD group ID for Appeals BO read-only accounts"
  type        = string
  default     = null
}

# API settings

variable "appeals_database_connection_string" {
  description = "The connection string used to connect to the BO Appeals MySQL database"
  sensitive   = true
  type        = string
}

variable "appeals_storage_endpoint" {
  description = "The endpoint of the BO Appeals storage account"
  sensitive   = true
  type        = string
}

variable "appeals_storage_default_container" {
  description = "The name of the storage container used to process documents"
  sensitive   = true
  type        = string
}

variable "horizon_api_url" {
  description = "The URL used to connect to Horizon web services"
  type        = string
}

variable "horizon_mock_integration" {
  description = "If true, integration with Horizon is simulated"
  type        = bool
}

variable "feature_appeal_horizon_use_mock" {
  default     = "false"
  description = "Whether or not the connection to horizon is mocked or real"
  type        = string
}

variable "feature_appeal_broadcasts_enabled" {
  default     = "false"
  description = "Whether or not Service Bus events are enabled on BO Appeals"
  type        = string
}

# Web settings

variable "back_office_appeals_hostname" {
  description = "Back Office Hostname"
  type        = string
}

variable "back_office_appeals_redis_connection_string_secret_name" {
  description = "The connection string (secret name) used to connect to the Back Office Appeals Redis Cache"
  type        = string
}

variable "horizon_web_url" {
  description = "The URL base path to create deep links to Horizon cases"
  type        = string
}

# Storage

variable "bo_appeals_storage_account_endpoint" {
  description = "The endpoint of the appeals back office storage account"
  type        = string
}

variable "bo_appeals_document_container_name" {
  description = "The container name for the appeals back office documents"
  type        = string
  default     = "bo-appeals-documents"
}
