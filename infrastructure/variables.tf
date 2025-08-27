# variables should be sorted A-Z

variable "alerts_enabled" {
  description = "Whether to enable Azure Monitor alerts"
  type        = string
  default     = true
}

variable "apps_config" {
  description = "Config for the apps"
  type = object({
    app_service_plan_sku              = string
    functions_node_version            = number
    functions_service_plan_sku        = string
    node_environment                  = string
    private_endpoint_enabled          = bool
    session_max_age                   = string
    use_system_test_bc_for_change_lpa = bool # Whether to allow STBC/STBC2 on change LPA list
    front_office_url                  = string

    auth = object({
      client_id = string
      group_ids = object({
        case_officer = string
        cs_team      = string
        inspector    = string
        legal        = string
        pads         = string
        read_only    = string
      })
    })

    integrations = object({
      horizon_api_url               = string      # The URL used to connect to the Horizon API
      horizon_mock                  = bool        # Whether to mock Horizon integration
      horizon_web_url               = string      # The URL base path to create deep links to Horizon cases
      horizon_timeout               = number      # The timeout, in milliseconds, for Horizon API connections
      service_bus_broadcast_enabled = bool        # Whether to send service bus messages
      enable_test_endpoints         = bool        # Whether to use test endpoints to help e2e
      notify_template_ids           = map(string) # List of template IDs for notify integration
    })

    featureFlags = object({
      featureFlagS78Written             = bool
      featureFlagS78Hearing             = bool
      featureFlagS78Inquiry             = bool
      featureFlagLinkedAppeals          = bool
      featureFlagS20                    = bool
      featureFlagCAS                    = bool
      featureFlagCasAdvert              = bool
      featureFlagIssueDecision          = bool
      featureFlagNotifyCaseHistory      = bool
      featureFlagReIssueDecision        = bool
      featureFlagSimplifyTeamAssignment = bool
      featureFlagChangeAppealType       = bool
      featureFlagPdfDownload            = bool
      featureFlagNetResidence           = bool
      featureFlagCancelCase             = bool
      featureFlagChangeProcedureType    = bool
    })

    logging = object({
      level_file   = string
      level_stdout = string
    })

    redis = object({
      capacity = number
      family   = string
      sku_name = string
    })
  })
}

variable "beta_feedback_url" {
  description = "URL for beta feedback form"
  type        = string
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

variable "documents_config" {
  description = "Domain name for docs storage account"
  type = object({
    # https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/storage_account#account_replication_type
    account_replication_type = string
    # Domain name for docs storage account
    domain = string
  })
}

variable "environment" {
  description = "The name of the environment in which resources will be deployed"
  type        = string
}

variable "front_door_config" {
  description = "Config for the frontdoor in tooling subscription"
  type = object({
    name        = string
    rg          = string
    ep_name     = string
    use_tooling = bool
  })
}

variable "front_office_infra_config" {
  description = "Config for the front office infra"
  type = object({
    deploy_connections = bool # whether to deploy connections to the front office - enable after the FO is deployed
    network = object({
      name = string
      rg   = string
    })
  })
}

variable "health_check_eviction_time_in_min" {
  description = "The eviction time in minutes for the health check"
  type        = number
  default     = 10
}

variable "horizon_infra_config" {
  description = "Config for the (legacy) Horizon infra"
  type = object({
    subscription_id    = string
    deploy_connections = bool # whether to deploy connections to the front office - enable after the FO is deployed
    network = object({
      name = string
      rg   = string
    })
  })
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
      representation    = string
    })
    events = object({
      appeal_has            = string
      appeal_s78            = string
      document              = string
      document_to_move      = string
      event                 = string
      listed_building       = string
      service_user          = string
      appeal_representation = string
      appeal_event_estimate = string
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
    container_registry_name = string
    container_registry_rg   = string
    network_name            = string
    network_rg              = string
    subscription_id         = string
  })
}

variable "vnet_config" {
  description = "VNet configuration"
  type = object({
    address_space                       = string
    apps_subnet_address_space           = string
    main_subnet_address_space           = string
    secondary_address_space             = string
    secondary_apps_subnet_address_space = string
    secondary_subnet_address_space      = string
  })
}

variable "web_app_domain" {
  description = "The domain for the web app"
  type        = string
}

variable "waf_rate_limits" {
  description = "Config for Service Bus"
  type = object({
    enabled             = bool
    duration_in_minutes = number
    threshold           = number
  })
}

