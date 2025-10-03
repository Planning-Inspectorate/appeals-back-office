locals {
  # action group keys from var.common_config.action_group_names
  # keys in this object used for alert name
  # max five action groups per alert
  sb_alerts = {
    # Appeals front office submissions
    "Submissions" = {
      topics = [
        var.sb_topic_names.submissions.appellant,
        var.sb_topic_names.submissions.lpa_questionnaire
      ],
      # could be back office or front office
      action_groups = [
        "fo_tech",
        "bo_tech",
        "fo_service_manager",
        "bo_service_manager"
      ]
    },
    # Appeals back office events - recieved by front office
    "Broadcasts" = {
      topics = [
        var.sb_topic_names.events.appeal_has,
        var.sb_topic_names.events.appeal_s78,
        var.sb_topic_names.events.document,
        var.sb_topic_names.events.service_user
      ],
      # could be back office, front office, or ODW issue
      action_groups = [
        "fo_tech",
        "bo_tech",
        "fo_service_manager",
        "bo_service_manager",
        "data_service_manager"
      ]
    },
    # Appeals back office events - internal to back office
    "Internal" = {
      topics = [
        var.sb_topic_names.events.document_to_move
      ],
      action_groups = [
        "bo_tech",
        "bo_service_manager"
      ]
    }
  }
}

resource "azurerm_monitor_metric_alert" "sb_dead_letter_alerts" {
  for_each = local.sb_alerts

  name                = "Dead Letter Alert - ${each.key} - ${local.service_bus.name}"
  resource_group_name = azurerm_resource_group.primary.name
  scopes              = [local.service_bus.id]
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
      action_group_id = data.azurerm_monitor_action_group.common[action_group_key.value].id
    }
  }
}
