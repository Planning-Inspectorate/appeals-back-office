apps_config = {
  app_service_plan_sku       = "P1v3"
  functions_node_version     = 18
  functions_service_plan_sku = "P1v3"
  node_environment           = "production"
  private_endpoint_enabled   = true

  auth = {
    client_id = "591f9564-095c-459a-b090-ce0f0a16ee09" # Appeals Back Office TEST
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
    service_bus_broadcast_enabled = true
  }

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
  resource_group_name = "pins-rg-common-test-ukw-001"
  action_group_names = {
    bo_tech              = "pins-ag-odt-appeals-bo-tech-test"
    bo_service_manager   = "pins-ag-odt-appeals-bo-service-manager-test"
    fo_tech              = "pins-ag-odt-appeals-fo-tech-test"
    fo_service_manager   = "pins-ag-odt-appeals-fo-service-manager-test"
    data_service_manager = "pins-ag-odt-data-service-manager-test"
    iap                  = "pins-ag-odt-iap-test"
    its                  = "pins-ag-odt-its-test"
    info_sec             = "pins-ag-odt-info-sec-test"
  }
}

common_infra_config = {
  network_name = "pins-vnet-common-test-ukw-001"
  network_rg   = "pins-rg-common-test-ukw-001"
}

documents_config = {
  account_replication_type = "LRS"
}
docs_domain = "https://back-office-appeals-docs-test.planninginspectorate.gov.uk"

environment = "test"

service_bus_config = {
  sku                           = "Premium"
  capacity                      = 1
  public_network_access_enabled = false
}

sql_config = {
  admin = {
    login_username = "pins-odt-sql-test-appeals-bo"
    object_id      = "1819fc4a-bd5e-4e01-a727-16d865fb3f82"
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
  public_network_access_enabled = true
}

vnet_config = {
  address_space                       = "10.15.4.0/22"
  apps_subnet_address_space           = "10.15.4.0/24"
  main_subnet_address_space           = "10.15.5.0/24"
  secondary_address_space             = "10.15.20.0/22"
  secondary_apps_subnet_address_space = "10.15.20.0/24"
  secondary_subnet_address_space      = "10.15.21.0/24"
}

web_app_domain = "back-office-appeals-test.planninginspectorate.gov.uk"
