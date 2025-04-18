apps_config = {
  app_service_plan_sku       = "P1v3"
  functions_node_version     = 20
  functions_service_plan_sku = "P1v3"
  node_environment           = "production"
  private_endpoint_enabled   = true
  session_max_age            = 10800000

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
    audit_days             = 30
    short_term_days        = 7
    long_term_weekly       = "P1W"
    long_term_monthly      = "P1M"
    long_term_yearly       = "P1Y"
    long_term_week_of_year = 1
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
