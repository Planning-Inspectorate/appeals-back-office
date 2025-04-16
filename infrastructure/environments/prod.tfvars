apps_config = {
  app_service_plan_sku       = "P1v3"
  functions_node_version     = 20
  functions_service_plan_sku = "P1v3"
  node_environment           = "production"
  private_endpoint_enabled   = true
  session_max_age            = 10800000

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
      appeal_generic_id                                               = "b29bbd23-6cf9-4173-b831-a915c79cf040"
      site_visit_change_accompanied_date_change_appellant_id          = "695939b8-5bd8-4ecc-92ae-167641d5408a"
      site_visit_change_accompanied_date_change_lpa_id                = "9c0fc905-6912-43a1-be4c-cc1f1e0303c2"
      site_visit_change_accompanied_to_access_required_appellant_id   = "24fd5269-db45-4da4-a6d2-47ede5c2e5f6"
      site_visit_change_accompanied_to_access_required_lpa_id         = "6571aec0-ea6b-416a-9365-f9414a931ab9"
      site_visit_change_accompanied_to_unaccompanied_appellant_id     = "25552ae8-a4ea-48e3-bd8b-939cc02b5db0"
      site_visit_change_accompanied_to_unaccompanied_lpa_id           = "6571aec0-ea6b-416a-9365-f9414a931ab9"
      site_visit_change_access_required_date_change_appellant_id      = "fb097cae-f19c-4c75-81e2-c394ec80c31d"
      site_visit_change_access_required_to_accompanied_appellant_id   = "9676a1cd-c54c-434f-aa5d-082c22ee9e78"
      site_visit_change_access_required_to_accompanied_lpa_id         = "47983ef3-f92c-47b8-bb0f-8debd9a19856"
      site_visit_change_access_required_to_unaccompanied_appellant_id = "832ea5b1-4aea-4c07-871b-3153beac13b4"
      site_visit_change_unaccompanied_to_access_required_appellant_id = "24fd5269-db45-4da4-a6d2-47ede5c2e5f6"
      site_visit_change_unaccompanied_to_accompanied_appellant_id     = "0345224c-d26c-4491-b412-7f49c1744e58"
      site_visit_change_unaccompanied_to_accompanied_lpa_id           = "47983ef3-f92c-47b8-bb0f-8debd9a19856"
      site_visit_schedule_access_required_appellant_id                = "7bd42625-5a45-46a4-8419-3271902c8e72"
      site_visit_schedule_accompanied_appellant_id                    = "2b1bc1e3-c9bb-440b-b04b-074757794d32"
      site_visit_schedule_accompanied_lpa_id                          = "47983ef3-f92c-47b8-bb0f-8debd9a19856"
      site_visit_schedule_unaccompanied_appellant_id                  = "3f3714f0-00f0-4fc8-8c49-551e4a844643"
    }
  }

  featureFlags = {
    featureFlagS78Written    = true
    featureFlagS78Hearing    = false
    featureFlagLinkedAppeals = false
  }

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
  sku_name    = "S0"
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
