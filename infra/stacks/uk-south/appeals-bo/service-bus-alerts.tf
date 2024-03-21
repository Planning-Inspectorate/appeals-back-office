# dead-letter alerts - configured in locals sb_alerts with groups of topic names and action groups
resource "azurerm_monitor_metric_alert" "sb_dead_letter_alerts" {
  for_each = local.sb_alerts

  name                = "Dead Letter Alert - ${each.key} - ${azurerm_servicebus_namespace.back_office.name}"
  resource_group_name = azurerm_resource_group.back_office_stack.name
  scopes              = [azurerm_servicebus_namespace.back_office.id]
  description         = "Triggered when messages are added to dead-letter queue"
  severity            = 1
  frequency           = "PT5M"
  window_size         = "PT15M"

  criteria {
    metric_namespace = "Microsoft.ServiceBus/namespaces"

    metric_name = "DeadletteredMessages"
    aggregation = "Minimum"
    operator    = "GreaterThanOrEqual"
    threshold   = 1 # any dead-lettered messages

    dimension { # separate alerts by topic
      name     = "EntityName"
      operator = "Include"
      values   = each.value["topics"]
    }
  }

  dynamic "action" {
    for_each = each.value["action_groups"]
    iterator = action_group_key

    content {
      action_group_id = var.action_group_ids_map[action_group_key.value]
    }
  }
}
