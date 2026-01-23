apps_config = {
  app_service_plan_sku       = "P1v3"
  functions_node_version     = 22
  functions_service_plan_sku = "P1v3"
  node_environment           = "production"
  private_endpoint_enabled   = true
  session_max_age            = 10800000
  front_office_url           = "https://appeals-service-training.planninginspectorate.gov.uk"
  db_connection_limit        = 15

  auth = {
    client_id = "68721db0-46ce-4ac5-b404-a4eebdb5c8e1" # Appeals Back Office Training
    group_ids = {
      case_officer = "48a7eb59-34ee-4da8-84fc-3b27f473b4f9"
      cs_team      = "863ffff7-b3c2-4c83-b82b-c2443cac96ae"
      inspector    = "e7a0bcbc-aa39-496f-8b73-aa91e7577285"
      legal        = "b7b4aff7-df95-42cc-840e-b3a3a59f4d0d"
      pads         = "d8504f10-b4b8-4959-9165-686bf9501168"
      read_only    = "6d323e05-322e-44d3-9f26-0c427b047ccb"
    }
  }

  integrations = {
    horizon_api_url               = "http://10.0.7.4:8000"
    horizon_mock                  = false
    horizon_web_url               = "https://horizontest.planninginspectorate.gov.uk/otcs/llisapi.dll?func=ll&objId="
    horizon_timeout               = 5000
    service_bus_broadcast_enabled = true
    enable_test_endpoints         = true
    notify_template_ids = {
      appeal_generic_id = "b29bbd23-6cf9-4173-b831-a915c79cf040"
    }
  }

  featureFlags = {
    featureFlagS78Written             = true
    featureFlagS78Inquiry             = true
    featureFlagLinkedAppeals          = false
    featureFlagCAS                    = true
    featureFlagCasAdvert              = true
    featureFlagNotifyCaseHistory      = true
    featureFlagSimplifyTeamAssignment = true
    featureFlagPdfDownload            = true
    featureFlagNetResidence           = true
    featureFlagNetResidenceS20        = true
    featureFlagCancelCase             = true
    featureFlagChangeProcedureType    = true
    featureFlagAdvertisement          = true
    featureFlagHearingPostMvp         = true
    featureFlagAutoAssignTeam         = true
    featureFlagCancelSiteVisit        = true
    featureFlagSearchCaseOfficer      = true
    featureFlagEnforcementNotice      = true
    featureFlagEnforcementLinked      = false
    featureFlagInvalidDecisionLetter  = false
    featureFlagRule6Mvp               = false
    featureFlagRule6PoE               = false
    featureFlagExpeditedAppeals       = false
    featureFlagManuallyAddReps        = true
    featureFlagAppellantStatement     = true
    featureFlagRule6Statement         = false
    featureFlagLDC                    = false
    featureFlagRule6Costs             = false
  }

  use_system_test_bc_for_change_lpa = false

  logging = {
    level_file   = "silent"
    level_stdout = "info"
  }

  redis = {
    capacity = 1
    family   = "C"
    sku_name = "Standard"
  }
}

common_config = {
  resource_group_name = "pins-rg-common-training-ukw-001"
  action_group_names = {
    bo_tech              = "pins-ag-odt-appeals-bo-tech-training"
    bo_service_manager   = "pins-ag-odt-appeals-bo-service-manager-training"
    fo_tech              = "pins-ag-odt-appeals-fo-tech-training"
    fo_service_manager   = "pins-ag-odt-appeals-fo-service-manager-training"
    data_service_manager = "pins-ag-odt-data-service-manager-training"
    iap                  = "pins-ag-odt-iap-training"
    its                  = "pins-ag-odt-its-training"
    info_sec             = "pins-ag-odt-info-sec-training"
  }
}

documents_config = {
  account_replication_type = "LRS"
  domain                   = "https://back-office-appeals-docs-training.planninginspectorate.gov.uk"
}

environment = "training"

front_door_config = {
  name        = "pins-fd-common-tooling"
  rg          = "pins-rg-common-tooling"
  ep_name     = "pins-fde-appeals"
  use_tooling = true
}

front_office_infra_config = {
  deploy_connections = true
  network = {
    name = "pins-vnet-common-training-ukw-001"
    rg   = "pins-rg-common-training-ukw-001"
  }
}

horizon_infra_config = {
  deploy_connections = true
  subscription_id    = "cbd9712b-34c8-4c94-9633-37ffc0f54f9d"
  network = {
    name = "VNPRE-10.0.0.0-16"
    rg   = "PREHZN"
  }
}

monitoring_config = {
  web_app_insights_web_test_enabled = false
  log_daily_cap                     = 0.2
}

service_bus_config = {
  sku                           = "Premium"
  capacity                      = 1
  public_network_access_enabled = false
}

sql_config = {
  admin = {
    login_username = "pins-odt-sql-training-appeals-bo"
    object_id      = "9302da00-8d11-47fb-8894-76fdb47642d9"
  }
  sku_name    = "S0"
  max_size_gb = 250
  retention = {
    audit_days               = 30
    backup_interval_in_hours = 12
    short_term_days          = 7
    long_term_weekly         = "P1W"
    long_term_monthly        = "P1M"
    long_term_yearly         = "P1Y"
    long_term_week_of_year   = 1
  }
  public_network_access_enabled = false
}

vnet_config = {
  address_space                       = "10.15.8.0/22"
  apps_subnet_address_space           = "10.15.8.0/24"
  main_subnet_address_space           = "10.15.9.0/24"
  secondary_address_space             = "10.15.24.0/22"
  secondary_apps_subnet_address_space = "10.15.24.0/24"
  secondary_subnet_address_space      = "10.15.25.0/24"
}

web_app_domain = "back-office-appeals-training.planninginspectorate.gov.uk"

waf_rate_limits = {
  enabled             = true
  duration_in_minutes = 5
  threshold           = 1500
}
