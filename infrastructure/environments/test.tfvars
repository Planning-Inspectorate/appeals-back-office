common_config = {
  resource_group_name = "pins-rg-common-test-ukw-001"
  action_group_names = {
    bo_tech              = "pins-ag-odt-appeals-bo-tech-test"
    bo_service_manager   = "pins-ag-odt-appeals-bo-service-manager-test"
    fo_tech              = "pins-ag-odt-appeals-fo-tech-test"
    fo_service_manager   = "pins-ag-odt-appeals-fo-service-manager-test"
    data_service_manager = "pins-ag-odt-data-service-manager-test"
  }
}

environment = "test"

service_bus_config = {
  sku                           = "Premium"
  capacity                      = 1
  public_network_access_enabled = false
}

sql_config = {
  admin = {
    login_username = "pins-odt-sql-test-appeals-bo"
    object_id      = "819fc4a-bd5e-4e01-a727-16d865fb3f82"
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
  address_space                  = "10.15.4.0/22"
  main_subnet_address_space      = "10.15.4.0/24"
  secondary_address_space        = "10.15.20.0/22"
  secondary_subnet_address_space = "10.15.20.0/24"
}
web_app_domain = "back-office-appeals-test.planninginspectorate.gov.uk"
