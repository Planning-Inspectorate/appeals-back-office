# variables should be sorted A-Z

variable "alerts_enabled" {
  description = "Whether to enable Azure Monitor alerts"
  type        = string
  default     = true
}

variable "common_config" {
  description = "Config for the common resources, such as action groups"
  type = object({
    resource_group_name = string
    action_group_names = object({
      bo_tech              = string
      bo_service_manager   = string
      fo_tech              = string
      fo_service_manager   = string
      data_service_manager = string
      iap                  = string
      its                  = string
      info_sec             = string
    })
  })
}

variable "environment" {
  description = "The name of the environment in which resources will be deployed"
  type        = string
}

variable "service_bus_config" {
  description = "Config for Service Bus"
  type = object({
    sku                           = string
    capacity                      = number
    public_network_access_enabled = bool
  })
}

variable "sb_ttl" {
  description = "Service bus TTL settings"
  type = object({
    # default topic TTL
    default = string
    # TTL for subscriptions
    bo_sub = string
    # TTL for internal subscriptions
    bo_internal = string
    # TTL for front office subscriptions
    fo_sub = string
  })
}

variable "sb_topic_names" {
  description = "Service bus topic names"
  type = object({
    submissions = object({
      appellant         = string
      lpa_questionnaire = string
    })
    events = object({
      appeal           = string
      document         = string
      document_to_move = string
      service_user     = string
    })
  })
}

variable "sql_config" {
  description = "Config for SQL Server and DB"
  type = object({
    admin = object({
      login_username = string
      object_id      = string
    })
    sku_name    = string
    max_size_gb = number
    retention = object({
      audit_days             = number
      short_term_days        = number
      long_term_weekly       = string
      long_term_monthly      = string
      long_term_yearly       = string
      long_term_week_of_year = number
    })
    public_network_access_enabled = bool
  })
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

variable "vnet_config" {
  description = "VNet configuration"
  type = object({
    address_space                  = string
    main_subnet_address_space      = string
    secondary_address_space        = string
    secondary_subnet_address_space = string
  })
}

variable "web_app_domain" {
  description = "The domain for the web app"
  type        = string
}
