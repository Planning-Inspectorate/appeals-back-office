locals {
  service_name = "back-office"
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
      "password=${random_password.back_office_sql_server_password_app.result}",
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

  resource_suffix = "${var.environment}-${module.azure_region_ukw.location_short}-${var.instance}"

  tags = merge(
    var.common_tags,
    {
      Region      = module.azure_region_ukw.location
      ServiceName = local.service_name
    }
  )

  # action group keys from common/locals.tf all_action_groups
  # keys in this object used for alert name
  # max five action groups per alert
  sb_alerts = {
    # Common back office events
    "Back Office Events" = {
      topics = [
        var.sb_topic_names.common.service_user
      ],
      action_groups = [
        "appeals-bo-tech",
        "applications-bo-tech",
        "data-tech"
      ]
    },
    # Applications front office submissions
    "Applications FO Submissions" = {
      topics = [
        var.sb_topic_names.applications.commands.register_nsip_subscription,
        var.sb_topic_names.applications.commands.register_representation,
        var.sb_topic_names.applications.commands.deadline_submission_topic,
        var.sb_topic_names.applications.commands.deadline_submission_result
      ],
      # could be back office or front office issue
      action_groups = [
        "applications-fo-tech",
        "applications-bo-tech",
        "applications-fo-service-manager",
        "applications-bo-service-manager"
      ]
    },
    # Applications back office events - recieved by front office
    "Applications BO Events (to FO, ODW)" = {
      topics = [
        var.sb_topic_names.applications.events.nsip_project,
        var.sb_topic_names.applications.events.nsip_project_update,
        var.sb_topic_names.applications.events.nsip_documents,
        var.sb_topic_names.applications.events.nsip_exam_timetable,
        var.sb_topic_names.applications.events.nsip_representation,
        var.sb_topic_names.applications.events.nsip_s51_advice
      ],
      # could be back office, front office, or ODW issue
      action_groups = [
        "applications-fo-tech",
        "applications-bo-tech",
        "applications-fo-service-manager",
        "applications-bo-service-manager",
        "data-service-manager"
      ]
    },
    # Applications back office events - ODW only
    "Applications BO Events (to ODW)" = {
      topics = [
        var.sb_topic_names.applications.events.folders,
        var.sb_topic_names.applications.events.nsip_subscription
      ],
      # could be back office or ODW issue
      action_groups = [
        "applications-bo-tech",
        "applications-bo-service-manager",
        "data-tech",
        "data-service-manager"
      ]
    },
    # Appeals front office submissions
    "Appeals FO Submissions" = {
      topics = [
        var.sb_topic_names.appeals.commands.appellant_submission,
        var.sb_topic_names.appeals.commands.lpa_response_submission,
        var.sb_topic_names.appeals.commands.listed_building
      ],
      # could be back office or front office
      action_groups = [
        "appeals-fo-tech",
        "appeals-bo-tech",
        "appeals-fo-service-manager",
        "appeals-bo-service-manager"
      ]
    },
    # Appeals back office events - recieved by front office
    "Appeals BO Events (to FO, ODW)" = {
      topics = [
        var.sb_topic_names.appeals.events.case,
        var.sb_topic_names.appeals.events.document
      ],
      # could be back office, front office, or ODW issue
      action_groups = [
        "appeals-fo-tech",
        "appeals-bo-tech",
        "appeals-fo-service-manager",
        "appeals-bo-service-manager",
        "data-service-manager"
      ]
    },
    # Appeals back office events - internal to back office
    "Appeals BO Events (internal)" = {
      topics = [
        var.sb_topic_names.appeals.events.document_to_move
      ],
      action_groups = [
        "appeals-bo-tech",
        "appeals-bo-service-manager"
      ]
    }
  }
  bo_appeals_tech_emails      = [for rec in data.azurerm_monitor_action_group.bo_appeals_tech.email_receiver : rec.email_address]
  bo_applications_tech_emails = [for rec in data.azurerm_monitor_action_group.bo_applications_tech.email_receiver : rec.email_address]
  tech_emails                 = concat(local.bo_appeals_tech_emails, local.bo_applications_tech_emails)
}
