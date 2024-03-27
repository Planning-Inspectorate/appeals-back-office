
resource "azurerm_application_insights" "back_office_appeals_insights" {
  name                 = "pins-ai-${local.service_name}-${local.resource_suffix}-appeals-insights"
  location             = azurerm_resource_group.back_office_stack.location
  resource_group_name  = azurerm_resource_group.back_office_stack.name
  workspace_id         = azurerm_log_analytics_workspace.back_office.id
  application_type     = "web"
  daily_data_cap_in_gb = 10
}

resource "azurerm_log_analytics_workspace" "back_office" {
  name                = "pins-log-${local.service_name}-${local.resource_suffix}"
  resource_group_name = azurerm_resource_group.back_office_stack.name
  location            = azurerm_resource_group.back_office_stack.location
  sku                 = "PerGB2018"
  retention_in_days   = 30

  tags = local.tags
}

resource "azurerm_monitor_diagnostic_setting" "back_office_sql_database" {
  name                       = "SQLDatabaseAudit"
  target_resource_id         = azurerm_mssql_database.back_office.id
  log_analytics_workspace_id = azurerm_log_analytics_workspace.back_office.id

  enabled_log {
    category = "SQLSecurityAuditEvents"
  }

  metric {
    category = "AllMetrics"
  }

  lifecycle {
    ignore_changes = [
      enabled_log,
      metric
    ]
  }
}

resource "azurerm_mssql_server_extended_auditing_policy" "back_office_sql_server" {
  enabled                = var.monitoring_alerts_enabled
  storage_endpoint       = azurerm_storage_account.back_office_sql_server.primary_blob_endpoint
  server_id              = azurerm_mssql_server.back_office.id
  retention_in_days      = var.sql_database_configuration["audit_retention_days"]
  log_monitoring_enabled = false

  depends_on = [
    azurerm_role_assignment.back_office_sql_server,
    azurerm_storage_account.back_office_sql_server,
  ]
}

resource "azurerm_mssql_database_extended_auditing_policy" "back_office_sql_database" {
  database_id            = azurerm_mssql_database.back_office.id
  log_monitoring_enabled = true
}

# new stuff from here
resource "azurerm_advanced_threat_protection" "back_office_sql_server" {
  target_resource_id = azurerm_storage_account.back_office_sql_server.id
  enabled            = true
}

resource "azurerm_role_assignment" "back_office_sql_server" {
  scope                = azurerm_storage_account.back_office_sql_server.id
  role_definition_name = "Storage Blob Data Contributor"
  principal_id         = azurerm_mssql_server.back_office.identity[0].principal_id
}

resource "azurerm_mssql_server_security_alert_policy" "back_office_sql_server" {
  state                      = var.monitoring_alerts_enabled ? "Enabled" : "Disabled"
  resource_group_name        = azurerm_resource_group.back_office_stack.name
  server_name                = azurerm_mssql_server.back_office.name
  storage_endpoint           = azurerm_storage_account.back_office_sql_server.primary_blob_endpoint
  storage_account_access_key = azurerm_storage_account.back_office_sql_server.primary_access_key
  retention_days             = var.sql_database_configuration["audit_retention_days"]
  email_account_admins       = true
  email_addresses            = local.tech_emails
}

resource "azurerm_mssql_server_vulnerability_assessment" "back_office_sql_server" {
  #checkov:skip=CKV2_AZURE_3: scans enabled by env
  #checkov:skip=CKV2_AZURE_4: false positive?
  #checkov:skip=CKV2_AZURE_5: false positive?

  count                           = var.monitoring_alerts_enabled ? 1 : 0
  server_security_alert_policy_id = azurerm_mssql_server_security_alert_policy.back_office_sql_server.id
  storage_container_path          = "${azurerm_storage_account.back_office_sql_server.primary_blob_endpoint}${azurerm_storage_container.back_office_sql_server.name}/"
  storage_account_access_key      = azurerm_storage_account.back_office_sql_server.primary_access_key

  recurring_scans {
    enabled                   = var.monitoring_alerts_enabled
    email_subscription_admins = true
    emails                    = local.tech_emails
  }
}

resource "azurerm_monitor_metric_alert" "back_office_sql_db_cpu_alert" {
  name                = "${local.service_name} SQL CPU Alert ${local.resource_suffix}"
  resource_group_name = azurerm_resource_group.back_office_stack.name
  scopes              = [azurerm_mssql_database.back_office.id]
  description         = "Action will be triggered when cpu percent is greater than 80."
  window_size         = "PT5M"
  frequency           = "PT1M"
  severity            = 2

  criteria {
    metric_namespace = "Microsoft.Sql/servers/databases"
    metric_name      = "cpu_percent"
    aggregation      = "Average"
    operator         = "GreaterThan"
    threshold        = 80
  }

  action {
    action_group_id = var.action_group_ids.bo_applications_tech
  }

  tags = local.tags
}

resource "azurerm_monitor_metric_alert" "back_office_sql_db_dtu_alert" {
  name                = "${local.service_name} SQL DTU Alert ${local.resource_suffix}"
  resource_group_name = azurerm_resource_group.back_office_stack.name
  scopes              = [azurerm_mssql_database.back_office.id]
  description         = "Action will be triggered when DTU percent is greater than 80."
  window_size         = "PT5M"
  frequency           = "PT1M"
  severity            = 2

  criteria {
    metric_namespace = "Microsoft.Sql/servers/databases"
    metric_name      = "dtu_consumption_percent"
    aggregation      = "Average"
    operator         = "GreaterThan"
    threshold        = 80
  }

  action {
    action_group_id = var.action_group_ids.bo_applications_tech
  }

  tags = local.tags
}

resource "azurerm_monitor_metric_alert" "back_office_sql_db_log_io_alert" {
  name                = "${local.service_name} SQL Log IO Alert ${local.resource_suffix}"
  resource_group_name = azurerm_resource_group.back_office_stack.name
  scopes              = [azurerm_mssql_database.back_office.id]
  description         = "Action will be triggered when DTU percent is greater than 80."
  window_size         = "PT5M"
  frequency           = "PT1M"
  severity            = 2

  criteria {
    metric_namespace = "Microsoft.Sql/servers/databases"
    metric_name      = "log_write_percent"
    aggregation      = "Average"
    operator         = "GreaterThan"
    threshold        = 80
  }

  action {
    action_group_id = var.action_group_ids.bo_applications_tech
  }

  tags = local.tags
}

resource "azurerm_monitor_metric_alert" "back_office_sql_db_deadlock_alert" {
  name                = "${local.service_name} SQL Deadlock Alert ${local.resource_suffix}"
  resource_group_name = azurerm_resource_group.back_office_stack.name
  scopes              = [azurerm_mssql_database.back_office.id]
  description         = "Action will be triggered whenever the count of deadlocks is greater than 1."
  window_size         = "PT5M"
  frequency           = "PT1M"
  severity            = 2

  criteria {
    metric_namespace = "Microsoft.Sql/servers/databases"
    metric_name      = "deadlock"
    aggregation      = "Count"
    operator         = "GreaterThanOrEqual"
    threshold        = 1
  }

  action {
    action_group_id = var.action_group_ids.bo_applications_tech
  }

  tags = local.tags
}

# appeals DB alerts
resource "azurerm_monitor_metric_alert" "back_office_appeals_sql_db_cpu_alert" {
  name                = "${local.service_name} Appeals SQL CPU Alert ${local.resource_suffix}"
  resource_group_name = azurerm_resource_group.back_office_stack.name
  scopes              = [azurerm_mssql_database.back_office_appeals.id]
  description         = "Action will be triggered when cpu percent is greater than 80."
  window_size         = "PT5M"
  frequency           = "PT1M"
  severity            = 2

  criteria {
    metric_namespace = "Microsoft.Sql/servers/databases"
    metric_name      = "cpu_percent"
    aggregation      = "Average"
    operator         = "GreaterThan"
    threshold        = 80
  }

  action {
    action_group_id = var.action_group_ids.bo_appeals_tech
  }

  tags = local.tags
}

resource "azurerm_monitor_metric_alert" "back_office_appeals_sql_db_dtu_alert" {
  name                = "${local.service_name} Appeals SQL DTU Alert ${local.resource_suffix}"
  resource_group_name = azurerm_resource_group.back_office_stack.name
  scopes              = [azurerm_mssql_database.back_office_appeals.id]
  description         = "Action will be triggered when DTU percent is greater than 80."
  window_size         = "PT5M"
  frequency           = "PT1M"
  severity            = 2

  criteria {
    metric_namespace = "Microsoft.Sql/servers/databases"
    metric_name      = "dtu_consumption_percent"
    aggregation      = "Average"
    operator         = "GreaterThan"
    threshold        = 80
  }

  action {
    action_group_id = var.action_group_ids.bo_appeals_tech
  }

  tags = local.tags
}

resource "azurerm_monitor_metric_alert" "back_office_appeals_sql_db_log_io_alert" {
  name                = "${local.service_name} Appeals SQL Log IO Alert ${local.resource_suffix}"
  resource_group_name = azurerm_resource_group.back_office_stack.name
  scopes              = [azurerm_mssql_database.back_office_appeals.id]
  description         = "Action will be triggered when DTU percent is greater than 80."
  window_size         = "PT5M"
  frequency           = "PT1M"
  severity            = 2

  criteria {
    metric_namespace = "Microsoft.Sql/servers/databases"
    metric_name      = "log_write_percent"
    aggregation      = "Average"
    operator         = "GreaterThan"
    threshold        = 80
  }

  action {
    action_group_id = var.action_group_ids.bo_appeals_tech
  }

  tags = local.tags
}

resource "azurerm_monitor_metric_alert" "back_office_appeals_sql_db_deadlock_alert" {
  name                = "${local.service_name} Appeals SQL Deadlock Alert ${local.resource_suffix}"
  resource_group_name = azurerm_resource_group.back_office_stack.name
  scopes              = [azurerm_mssql_database.back_office_appeals.id]
  description         = "Action will be triggered whenever the count of deadlocks is greater than 1."
  window_size         = "PT5M"
  frequency           = "PT1M"
  severity            = 2

  criteria {
    metric_namespace = "Microsoft.Sql/servers/databases"
    metric_name      = "deadlock"
    aggregation      = "Count"
    operator         = "GreaterThanOrEqual"
    threshold        = 1
  }

  action {
    action_group_id = var.action_group_ids.bo_appeals_tech
  }

  tags = local.tags
}
