apps_config = {
  app_service_plan_sku       = "P1v3"
  functions_node_version     = 22
  functions_service_plan_sku = "P1v3"
  node_environment           = "production"
  private_endpoint_enabled   = true
  session_max_age            = 10800000
  front_office_url           = "https://appeal-planning-decision.service.gov.uk"

  auth = {
    client_id = "ba49fd0e-11ad-48e2-8bfb-a203defb625f" # Appeals Back Office PROD
    group_ids = {
      case_officer = "5d82e08c-8f05-40ea-a3df-d306f3a2c870"
      cs_team      = "4b64c25d-1946-41c4-b031-45e5d0fa67c9"
      inspector    = "c921094a-318f-4996-be5e-9bd2ef9b7bdf"
      legal        = "adad581e-e76e-4cbb-8251-bdd136f4fa2c"
      pads         = "2d9e47f0-c803-423d-95d6-d1df72d6b7d8"
      read_only    = "5e0082df-ab71-4e10-91ca-36e3ed587a29"
    }
  }

  integrations = {
    horizon_api_url               = "http://10.224.161.68:8000"
    horizon_mock                  = false
    horizon_web_url               = "https://horizonweb.planninginspectorate.gov.uk/otcs/llisapi.dll?func=ll&objId="
    horizon_timeout               = 5000
    service_bus_broadcast_enabled = true
    enable_test_endpoints         = false
    notify_template_ids = {
      appeal_generic_id = "b29bbd23-6cf9-4173-b831-a915c79cf040"
    }
  }

  featureFlags = {
    featureFlagS78Written             = true
    featureFlagS78Hearing             = true
    featureFlagS78Inquiry             = false
    featureFlagLinkedAppeals          = false
    featureFlagCAS                    = false
    featureFlagCasAdvert              = false
    featureFlagNotifyCaseHistory      = true
    featureFlagSimplifyTeamAssignment = true
    featureFlagChangeAppealType       = false
    featureFlagPdfDownload            = true
    featureFlagNetResidence           = true
    featureFlagNetResidenceS20        = true
    featureFlagCancelCase             = true
    featureFlagChangeProcedureType    = false
    featureFlagAdvertisement          = false
    featureFlagHearingPostMvp         = true
    featureFlagAutoAssignTeam         = true
    featureFlagCancelSiteVisit        = false
    featureFlagSearchCaseOfficer      = false
    featureFlagEnforcementNotice      = false
    featureFlagInvalidDecisionLetter  = false
    featureFlagRule6Parties           = false
    featureFlagExpeditedAppeals       = false
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
  resource_group_name = "pins-rg-common-prod-ukw-001"
  action_group_names = {
    bo_tech              = "pins-ag-odt-appeals-bo-tech-prod"
    bo_service_manager   = "pins-ag-odt-appeals-bo-service-manager-prod"
    fo_tech              = "pins-ag-odt-appeals-fo-tech-prod"
    fo_service_manager   = "pins-ag-odt-appeals-fo-service-manager-prod"
    data_service_manager = "pins-ag-odt-data-service-manager-prod"
    iap                  = "pins-ag-odt-iap-prod"
    its                  = "pins-ag-odt-its-prod"
    info_sec             = "pins-ag-odt-info-sec-prod"
  }
}

documents_config = {
  account_replication_type = "GZRS"
  domain                   = "https://appeal-documents.planninginspectorate.gov.uk"
}

environment = "prod"

front_door_config = {
  name        = "pins-fd-common-prod"
  rg          = "pins-rg-common-prod"
  ep_name     = "pins-fde-appeals-prod"
  use_tooling = false
}

front_office_infra_config = {
  deploy_connections = true
  network = {
    name = "pins-vnet-common-prod-ukw-001"
    rg   = "pins-rg-common-prod-ukw-001"
  }
}

horizon_infra_config = {
  deploy_connections = true
  subscription_id    = "cbd9712b-34c8-4c94-9633-37ffc0f54f9d"
  network = {
    name = "VNPRD-192.168.0.0-16"
    rg   = "PRDHZN"
  }
}

monitoring_config = {
  web_app_insights_web_test_enabled = true
  log_daily_cap                     = 0.5
}

service_bus_config = {
  sku                           = "Premium"
  capacity                      = 1
  public_network_access_enabled = false
}

sql_config = {
  admin = {
    login_username = "pins-odt-sql-prod-appeals-bo"
    object_id      = "0fff01c6-b8bc-4b32-8f2d-1a1d122b7189"
  }
  sku_name    = "S3"
  max_size_gb = 250
  retention = {
    audit_days             = 120
    short_term_days        = 30
    long_term_weekly       = "P1W"
    long_term_monthly      = "P1M"
    long_term_yearly       = "P1Y"
    long_term_week_of_year = 1
  }
  public_network_access_enabled = false
}

vnet_config = {
  address_space                       = "10.15.12.0/22"
  apps_subnet_address_space           = "10.15.12.0/24"
  main_subnet_address_space           = "10.15.13.0/24"
  secondary_address_space             = "10.15.28.0/22"
  secondary_apps_subnet_address_space = "10.15.28.0/24"
  secondary_subnet_address_space      = "10.15.29.0/24"
}

web_app_domain = "back-office-appeals.planninginspectorate.gov.uk"

waf_rate_limits = {
  enabled             = true
  duration_in_minutes = 5
  threshold           = 1500
}
