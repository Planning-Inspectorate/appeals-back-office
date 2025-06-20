apps_config = {
  app_service_plan_sku       = "P0v3"
  functions_node_version     = 20
  functions_service_plan_sku = "P0v3"
  node_environment           = "development"
  private_endpoint_enabled   = false
  session_max_age            = 10800000
  front_office_url           = "https://appeals-service-dev.planninginspectorate.gov.uk"

  auth = {
    client_id = "64c20f53-becf-4b7e-ba62-c1dc9b03ccf9" # Appeals Back Office DEV
    group_ids = {
      case_officer = "cc4133e5-2319-4762-8a7b-33413701210a"
      cs_team      = "455cbf03-f92f-4357-8daa-9f513b21fb73"
      inspector    = "0724c372-098d-4eef-acfb-bc85cd483dd1"
      legal        = "369caed5-fe22-445e-8cdc-8b2f6746afc7"
      pads         = "5afda392-73c5-4c18-a76f-7e3b1933813c"
      read_only    = "60acabaa-6ac9-4462-828a-b79adc3d802c"
    }
  }

  integrations = {
    horizon_api_url               = "http://10.0.7.4:8000" # required by config validation, even if mocked
    horizon_mock                  = true
    horizon_web_url               = ""
    horizon_timeout               = 5000
    service_bus_broadcast_enabled = true
    enable_test_endpoints         = true
    notify_template_ids = {
      appeal_generic_id = "3fd5fc42-d77f-42c2-984a-cf9b89e4c415"
    }
  }

  featureFlags = {
    featureFlagS78Written      = true
    featureFlagS78Hearing      = true
    featureFlagS78Inquiry      = true
    featureFlagLinkedAppeals   = true
    featureFlagS20             = true
    featureFlagCAS             = true
    featureFlagIssueDecision   = true
    featureFlagReIssueDecision = true
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

alerts_enabled = false

common_config = {
  resource_group_name = "pins-rg-common-dev-ukw-001"
  action_group_names = {
    bo_tech              = "pins-ag-odt-appeals-bo-tech-dev"
    bo_service_manager   = "pins-ag-odt-appeals-bo-service-manager-dev"
    fo_tech              = "pins-ag-odt-appeals-fo-tech-dev"
    fo_service_manager   = "pins-ag-odt-appeals-fo-service-manager-dev"
    data_service_manager = "pins-ag-odt-data-service-manager-dev"
    iap                  = "pins-ag-odt-iap-dev"
    its                  = "pins-ag-odt-its-dev"
    info_sec             = "pins-ag-odt-info-sec-dev"
  }
}

documents_config = {
  account_replication_type = "LRS"
  domain                   = "https://back-office-appeals-docs-dev.planninginspectorate.gov.uk"
}

environment = "dev"

front_door_config = {
  name        = "pins-fd-common-tooling"
  rg          = "pins-rg-common-tooling"
  ep_name     = "pins-fde-appeals"
  use_tooling = true
}

front_office_infra_config = {
  deploy_connections = true
  network = {
    name = "pins-vnet-common-dev-ukw-001"
    rg   = "pins-rg-common-dev-ukw-001"
  }
}

horizon_infra_config = {
  deploy_connections = false
  # this isn't needed, but providers cannot be optional
  # we use the tooling sub ID here so that the provider doesn't error
  # but its not used for anything
  # see https://github.com/hashicorp/terraform/issues/31340
  subscription_id = "edb1ff78-90da-4901-a497-7e79f966f8e2"
  network = {
    name = ""
    rg   = ""
  }
}

service_bus_config = {
  sku                           = "Standard"
  capacity                      = 0
  public_network_access_enabled = true
}

sql_config = {
  admin = {
    login_username = "pins-odt-sql-dev-appeals-bo"
    object_id      = "1c3b7d11-36c4-41ca-90b5-d15eafbe3b61"
  }
  sku_name    = "Basic"
  max_size_gb = 2
  retention = {
    audit_days             = 7
    short_term_days        = 7
    long_term_weekly       = "P1W"
    long_term_monthly      = "P1M"
    long_term_yearly       = "P1Y"
    long_term_week_of_year = 1
  }
  public_network_access_enabled = true
}

vnet_config = {
  address_space                       = "10.15.0.0/22"
  apps_subnet_address_space           = "10.15.0.0/24"
  main_subnet_address_space           = "10.15.1.0/24"
  secondary_address_space             = "10.15.16.0/22"
  secondary_apps_subnet_address_space = "10.15.16.0/24"
  secondary_subnet_address_space      = "10.15.17.0/24"
}

web_app_domain = "back-office-appeals-dev.planninginspectorate.gov.uk"

waf_rate_limits = {
  enabled             = true
  duration_in_minutes = 5
  threshold           = 1500
}
