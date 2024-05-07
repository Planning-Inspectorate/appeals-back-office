alerts_enabled = false

common_config = {
  resource_group_name = "pins-rg-common-dev-ukw-001"
  action_group_names = {
    tech = "pins-ag-odt-appeals-bo-tech-dev"
  }
}

environment = "dev"

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
