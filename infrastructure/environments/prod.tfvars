common_config = {
  resource_group_name = "pins-rg-common-prod-ukw-001"
  action_group_names = {
    tech = "pins-ag-odt-appeals-bo-prod-test"
  }
}

environment = "prod"

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
  public_network_access_enabled = true
}

vnet_config = {
  address_space                  = "10.15.12.0/22"
  main_subnet_address_space      = "10.15.12.0/24"
  secondary_address_space        = "10.15.28.0/22"
  secondary_subnet_address_space = "10.15.28.0/24"
}
web_app_domain = "back-office-appeals.planninginspectorate.gov.uk"
