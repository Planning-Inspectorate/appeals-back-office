apps_config = {
  app_service_plan_sku       = "P1v3"
  functions_node_version     = 20
  functions_service_plan_sku = "P1v3"
  node_environment           = "production"
  private_endpoint_enabled   = true
  session_max_age            = 10800000
  front_office_url           = "https://appeals-service-staging.planninginspectorate.gov.uk"
  db_connection_limit        = 15

  auth = {
    client_id = "93848033-8cc2-4390-852c-7a6ad4f3c286" # Appeals Back Office staging
    group_ids = {
      case_officer = "e30a4389-029b-4de8-a94b-c492a3a0854a"
      cs_team      = "812fec35-4f1e-4a7c-bb1a-49d1a9fea519"
      inspector    = "3cf2c6ae-cd39-4027-accd-3c906b5462d4"
      legal        = "5ab0da43-964d-4897-ae44-880fe7990225"
      pads         = "2a609915-8dcf-4e83-8533-db0256d31646"
      read_only    = "0c67d3af-5e56-4f64-98b2-7f55a133b6ea"
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
      appeal_generic_id = "3fd5fc42-d77f-42c2-984a-cf9b89e4c415"
    }
  }

  featureFlags = {
    featureFlagS78Written             = true
    featureFlagS78Inquiry             = true
    featureFlagLinkedAppeals          = true
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
    featureFlagInvalidDecisionLetter  = true
    featureFlagRule6Mvp               = true
    featureFlagExpeditedAppeals       = true
    featureFlagManuallyAddReps        = true
    featureFlagAppellantStatement     = true
    featureFlagRule6Statement         = true
    featureFlagLDC                    = true

  }

  use_system_test_bc_for_change_lpa = true

  logging = {
    level_file   = "silent"
    level_stdout = "info"
  }

  redis = {
    capacity = 0
    family   = "C"
    sku_name = "Basic"
  }
}

common_config = {
  resource_group_name = "pins-rg-common-staging-ukw-001"
  action_group_names = {
    bo_tech              = "pins-ag-odt-appeals-bo-tech-staging"
    bo_service_manager   = "pins-ag-odt-appeals-bo-service-manager-staging"
    fo_tech              = "pins-ag-odt-appeals-fo-tech-staging"
    fo_service_manager   = "pins-ag-odt-appeals-fo-service-manager-staging"
    data_service_manager = "pins-ag-odt-data-service-manager-staging"
    iap                  = "pins-ag-odt-iap-staging"
    its                  = "pins-ag-odt-its-staging"
    info_sec             = "pins-ag-odt-info-sec-staging"
  }
}

documents_config = {
  account_replication_type = "LRS"
  domain                   = "https://back-office-appeals-docs-staging.planninginspectorate.gov.uk"
}

environment = "staging"

front_door_config = {
  name        = "pins-fd-common-tooling"
  rg          = "pins-rg-common-tooling"
  ep_name     = "pins-fde-appeals"
  use_tooling = true
}

front_office_infra_config = {
  deploy_connections = true
  network = {
    name = "pins-vnet-common-staging-ukw-001"
    rg   = "pins-rg-common-staging-ukw-001"
  }
}

horizon_infra_config = {
  deploy_connections = true
  subscription_id    = "cbd9712b-34c8-4c94-9633-37ffc0f54f9d"
  network = {
    name        = "VNPRE-10.0.0.0-16"
    rg          = "PREHZN"
    use_sb_test = true
  }
}

monitoring_config = {
  web_app_insights_web_test_enabled = false
  log_daily_cap                     = 0.2
}

service_bus_shared = {
  name                = "pins-sb-appeals-bo-test"
  resource_group_name = "pins-rg-appeals-bo-test"
  use_sb_test         = true
  network_name        = "pins-vnet-appeals-bo-test"
}

sb_topic_names = {
  submissions = {
    appellant         = "appeal-fo-appellant-submission-staging"
    lpa_questionnaire = "appeal-fo-lpa-questionnaire-submission-stag"
    representation    = "appeal-fo-representation-submission-staging"
  }

  events = {
    appeal_has            = "appeal-has-staging"
    appeal_s78            = "appeal-s78-staging"
    document              = "appeal-document-staging"
    document_to_move      = "appeal-document-to-move-staging"
    event                 = "appeal-event-staging"
    listed_building       = "listed-building-staging"
    service_user          = "appeal-service-user-staging"
    appeal_representation = "appeal-representation-staging"
    appeal_event_estimate = "appeal-event-estimate-staging"
  }
}

service_bus_config = {
  sku                           = "UNUSED"
  capacity                      = 1
  public_network_access_enabled = false
}

sql_config = {
  admin = {
    login_username = "pins-odt-sql-staging-appeals-bo"
    object_id      = "7c2f34b4-4f84-48dc-8b04-93881773bbf1"
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
  public_network_access_enabled = true
}

vnet_config = {
  address_space                       = "10.15.32.0/22"
  apps_subnet_address_space           = "10.15.32.0/24"
  main_subnet_address_space           = "10.15.33.0/24"
  secondary_address_space             = "10.15.36.0/22"
  secondary_apps_subnet_address_space = "10.15.36.0/24"
  secondary_subnet_address_space      = "10.15.37.0/24"
}

web_app_domain = "back-office-appeals-staging.planninginspectorate.gov.uk"

waf_rate_limits = {
  enabled             = true
  duration_in_minutes = 5
  threshold           = 1500
}
