apps_config = {
  app_service_plan_sku     = "P0v3"
  node_environment         = "development"
  private_endpoint_enabled = false

  integrations = {
    horizon_api_url               = ""
    horizon_mock                  = true
    horizon_web_url               = ""
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

environment = "dev"

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
  address_space                  = "10.15.0.0/22"
  main_subnet_address_space      = "10.15.0.0/24"
  secondary_address_space        = "10.15.16.0/22"
  secondary_subnet_address_space = "10.15.16.0/24"
}
web_app_domain = "back-office-appeals-dev.planninginspectorate.gov.uk"
