# Taken private endpoints out for time being



locals {
  # TODO: Let's create database-specific users and passwords instead for connection strings
  # Also, let's store this in Key Vault rather than just spitting it into env variables!
  sql_server_username             = "backofficeadmin_${random_id.username_suffix.id}"
  sql_server_username_app         = "backofficeapp_${random_id.username_suffix_app.id}"
  sql_server_username_appeals_app = "backofficeapp_${random_id.username_suffix_appeals_app.id}"

  sql_connection_string = join(
    ";",
    [
      "sqlserver://${azurerm_mssql_server.back_office.fully_qualified_domain_name}",
      "database=${azurerm_mssql_database.back_office.name}",
      "user=${azurerm_mssql_server.back_office.administrator_login}",
      "password=${azurerm_mssql_server.back_office.administrator_login_password}",
      "trustServerCertificate=true"
    ]
  )
  sql_connection_string_app = join(
    ";",
    [
      "sqlserver://${azurerm_mssql_server.back_office.fully_qualified_domain_name}",
      "database=${azurerm_mssql_database.back_office.name}",
      "user=${local.sql_server_username_app}",
      "password=${random_password.back_office_sql_server_password_app.result}", # needed?
      "trustServerCertificate=true"
    ]
  )

  appeals_sql_connection_string = join(
    ";",
    [
      "sqlserver://${azurerm_mssql_server.back_office.fully_qualified_domain_name}",
      "database=${azurerm_mssql_database.back_office_appeals.name}",
      "user=${azurerm_mssql_server.back_office.administrator_login}",
      "password=${azurerm_mssql_server.back_office.administrator_login_password}",
      "trustServerCertificate=true"
    ]
  )
  appeals_sql_connection_string_app = join(
    ";",
    [
      "sqlserver://${azurerm_mssql_server.back_office.fully_qualified_domain_name}",
      "database=${azurerm_mssql_database.back_office_appeals.name}",
      "user=${local.sql_server_username_appeals_app}",
      "password=${random_password.back_office_sql_server_password_appeals_app.result}",
      "trustServerCertificate=true"
    ]
  )
}

resource "random_password" "back_office_sql_server_password" {
  length           = 32
  special          = true
  override_special = "#&-_+"
  min_lower        = 2
  min_upper        = 2
  min_numeric      = 2
  min_special      = 2
}

resource "random_id" "username_suffix" {
  byte_length = 6
}

resource "random_id" "username_suffix_app" {
  byte_length = 6
}

resource "random_password" "back_office_sql_server_password_appeals_app" {
  length           = 32
  special          = true
  override_special = "#&-_+"
  min_lower        = 2
  min_upper        = 2
  min_numeric      = 2
  min_special      = 2
}

resource "random_id" "username_suffix_appeals_app" {
  byte_length = 6
}

resource "azurerm_key_vault_secret" "back_office_sql_server_password_appeals_app" {
  content_type = "text/plain"
  key_vault_id = var.key_vault_id
  name         = "back-office-sql-server-password-appeals-app"
  value        = random_password.back_office_sql_server_password_appeals_app.result

  tags = local.tags
}

resource "azurerm_key_vault_secret" "back_office_sql_server_username" {
  content_type = "text/plain"
  key_vault_id = var.key_vault_id
  name         = "back-office-sql-server-username"
  value        = azurerm_mssql_server.back_office.administrator_login

  tags = local.tags
}

resource "azurerm_key_vault_secret" "back_office_sql_server_username_appeals_app" {
  content_type = "text/plain"
  key_vault_id = var.key_vault_id
  name         = "back-office-sql-server-username-appeals-app"
  value        = local.sql_server_username_appeals_app

  tags = local.tags
}

resource "azurerm_key_vault_secret" "back_office_appeals_sql_connection_string" {
  content_type = "text/plain"
  key_vault_id = var.key_vault_id
  name         = "back-office-appeals-sql-connection-string"
  value        = local.appeals_sql_connection_string

  tags = local.tags
}

resource "azurerm_key_vault_secret" "back_office_appeals_sql_connection_string_app" {
  content_type = "text/plain"
  key_vault_id = var.key_vault_id
  name         = "back-office-appeals-sql-connection-string-app"
  value        = local.appeals_sql_connection_string_app

  tags = local.tags
}

# resource "azurerm_private_endpoint" "back_office_sql_server" {
#   name                = "pins-pe-${local.service_name}-sql-${local.resource_suffix}"
#   resource_group_name = azurerm_resource_group.appeals_back_office_rg1.name
#   location            = module.azure_region.location
#   subnet_id           = azurerm_subnet.back_office_ingress.id

#   private_dns_zone_group {
#     name                 = "sqlserverprivatednszone"
#     private_dns_zone_ids = [data.azurerm_private_dns_zone.database.id]
#   }

#   private_service_connection {
#     name                           = "privateendpointconnection"
#     private_connection_resource_id = azurerm_mssql_server.back_office.id
#     subresource_names              = ["sqlServer"]
#     is_manual_connection           = false
#   }

#   tags = local.tags
# }

resource "azurerm_mssql_database" "back_office_appeals" {
  name        = "pins-sqldb-${local.service_name}-appeals-${local.resource_suffix}"
  server_id   = azurerm_mssql_server.back_office.id
  collation   = "SQL_Latin1_General_CP1_CI_AS"
  sku_name    = var.sql_database_configuration["sku_name"]
  max_size_gb = var.sql_database_configuration["max_size_gb"]

  short_term_retention_policy {
    retention_days = var.sql_database_configuration["short_term_retention_days"]
  }

  tags = local.tags
}

resource "azurerm_storage_account" "back_office_sql_server" {
  name                             = replace("pinsstsqlapps${local.resource_suffix}", "-", "")
  resource_group_name              = azurerm_resource_group.appeals_back_office_rg1.name
  location                         = module.azure_region.location
  account_tier                     = "Standard"
  account_replication_type         = "GRS"
  min_tls_version                  = "TLS1_2"
  enable_https_traffic_only        = true
  allow_nested_items_to_be_public  = false
  cross_tenant_replication_enabled = false

  # network_rules {
  #   default_action             = "Deny"
  #   ip_rules                   = ["127.0.0.1"]
  #   virtual_network_subnet_ids = [azurerm_subnet.back_office_ingress.id]
  #   bypass                     = ["AzureServices"]
  # }

  identity {
    type = "SystemAssigned"
  }

  tags = local.tags
}

resource "azurerm_storage_container" "back_office_sql_server" {
  name                  = "sqlvulnerabilityassessment"
  storage_account_name  = azurerm_storage_account.back_office_sql_server.name
  container_access_type = "private"
}

resource "random_password" "back_office_sql_server_password_app" {
  length           = 32
  special          = true
  override_special = "#&-_+"
  min_lower        = 2
  min_upper        = 2
  min_numeric      = 2
  min_special      = 2
}

resource "azurerm_key_vault_secret" "back_office_sql_server_password" {
  content_type = "text/plain"
  key_vault_id = var.key_vault_id
  name         = "back-office-sql-server-password"
  value        = azurerm_mssql_server.back_office.administrator_login_password

  tags = local.tags
}

resource "azurerm_key_vault_secret" "back_office_sql_server_password_app" {
  content_type = "text/plain"
  key_vault_id = var.key_vault_id
  name         = "back-office-sql-server-password-app"
  value        = random_password.back_office_sql_server_password_app.result

  tags = local.tags
}

resource "azurerm_key_vault_secret" "back_office_sql_connection_string" {
  content_type = "text/plain"
  key_vault_id = var.key_vault_id
  name         = "back-office-sql-server-connection-string"
  value        = local.sql_connection_string

  tags = local.tags
}

resource "azurerm_key_vault_secret" "back_office_sql_server_username_app" {
  content_type = "text/plain"
  key_vault_id = var.key_vault_id
  name         = "back-office-sql-server-username-app"
  value        = local.sql_server_username_app

  tags = local.tags
}

resource "azurerm_key_vault_secret" "back_office_sql_connection_string_app" {
  content_type = "text/plain"
  key_vault_id = var.key_vault_id
  name         = "back-office-sql-server-connection-string-app"
  value        = local.sql_connection_string_app

  tags = local.tags
}


resource "azurerm_mssql_server" "back_office" {
  name                          = "pins-sql-${local.service_name}-${local.resource_suffix}"
  resource_group_name           = azurerm_resource_group.appeals_back_office_rg1.name
  location                      = module.azure_region.location
  version                       = "12.0"
  administrator_login           = local.sql_server_username
  administrator_login_password  = random_password.back_office_sql_server_password.result
  minimum_tls_version           = "1.2"
  public_network_access_enabled = var.database_public_access_enabled

  azuread_administrator {
    login_username = var.sql_server_azuread_administrator["login_username"]
    object_id      = var.sql_server_azuread_administrator["object_id"]
  }

  identity {
    type = "SystemAssigned"
  }

  tags = local.tags
}

resource "azurerm_mssql_database" "back_office" {
  name        = "pins-sqldb-${local.service_name}-${local.resource_suffix}"
  server_id   = azurerm_mssql_server.back_office.id
  collation   = "SQL_Latin1_General_CP1_CI_AS"
  sku_name    = var.sql_database_configuration["sku_name"]
  max_size_gb = var.sql_database_configuration["max_size_gb"]

  short_term_retention_policy {
    retention_days = var.sql_database_configuration["short_term_retention_days"]
  }

  tags = local.tags
}


# File needs re-organising
