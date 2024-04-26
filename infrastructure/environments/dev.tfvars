environment        = "dev"
vnet_address_space = "10.15.0.0/24"

subnet_ingress = "10.15.0.0/24"

# May need to be placed within locals
sql_database_configuration = {
  max_size_gb               = 2
  short_term_retention_days = 7 # 7-35
  audit_retention_days      = 7
  sku_name                  = "Basic"
}
