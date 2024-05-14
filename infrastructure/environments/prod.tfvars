apps_config = {
  app_service_plan_sku       = "P1v3"
  functions_node_version     = 18
  functions_service_plan_sku = "P1v3"
  node_environment           = "production"
  private_endpoint_enabled   = true

  auth = {
    client_id = "ba49fd0e-11ad-48e2-8bfb-a203defb625f" # Appeals Back Office PROD
    group_ids = {
      case_officer = "5d82e08c-8f05-40ea-a3df-d306f3a2c870"
      cs_team      = "785e6615-a9ea-44bf-a669-634e52b6f07a"
      inspector    = "c921094a-318f-4996-be5e-9bd2ef9b7bdf"
      legal        = "33fc8bdb-8c82-40ae-9a59-9eb5073f553b"
    }
  }

  integrations = {
    horizon_api_url               = "http://10.224.161.68:8000"
    horizon_mock                  = false
    horizon_web_url               = "https://horizonweb.planninginspectorate.gov.uk/otcs/llisapi.dll?func=ll&objId="
    service_bus_broadcast_enabled = false
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

docs_domain = "https://appeal-documents.planninginspectorate.gov.uk"

environment = "prod"

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
