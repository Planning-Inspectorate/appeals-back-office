environment = "test"

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
