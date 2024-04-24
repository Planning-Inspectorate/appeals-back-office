# resource "azurerm_servicebus_namespace" "back_office" {
#   name                          = "pins-sb-${local.service_name}-${local.resource_suffix}"
#   location                      = azurerm_resource_group.back_office_stack.location
#   resource_group_name           = azurerm_resource_group.back_office_stack.name
#   sku                           = var.service_bus_failover_enabled ? "Premium" : "Standard"
#   capacity                      = var.service_bus_failover_enabled ? 1 : 0
#   public_network_access_enabled = !var.service_bus_failover_enabled

#   tags = local.tags
# }

# # Create a private DNS zone for the SB private endpoint
# resource "azurerm_private_dns_zone" "back_office" {
#   count = var.service_bus_failover_enabled ? 1 : 0

#   name                = "privatelink.servicebus.windows.net"
#   resource_group_name = azurerm_resource_group.back_office_stack.name
# }

# resource "azurerm_private_dns_zone_virtual_network_link" "back_office" {
#   count = var.service_bus_failover_enabled ? 1 : 0

#   name                  = "service-bus-dns-link"
#   resource_group_name   = azurerm_resource_group.back_office_stack.name
#   private_dns_zone_name = azurerm_private_dns_zone.back_office[0].name
#   virtual_network_id    = var.common_vnet_id
# }


# # Create a private endpoint for the namespace
# resource "azurerm_private_endpoint" "back_office" {
#   count = var.service_bus_failover_enabled ? 1 : 0

#   name                = "pins-pe-${local.service_name}-sb-${local.resource_suffix}"
#   location            = azurerm_resource_group.back_office_stack.location
#   resource_group_name = azurerm_resource_group.back_office_stack.name
#   subnet_id           = azurerm_subnet.back_office_ingress.id

#   private_dns_zone_group {
#     name                 = "pins-pdns-${local.service_name}-sb-${local.resource_suffix}"
#     private_dns_zone_ids = [azurerm_private_dns_zone.back_office[0].id]
#   }

#   private_service_connection {
#     name                           = "pins-psc-${local.service_name}-sb-${local.resource_suffix}"
#     private_connection_resource_id = azurerm_servicebus_namespace.back_office.id
#     is_manual_connection           = false
#     subresource_names              = ["namespace"]
#   }

#   tags = local.tags
# }

# # Common Topics
# resource "azurerm_servicebus_topic" "service_user" {
#   name                = var.sb_topic_names.common.service_user
#   namespace_id        = azurerm_servicebus_namespace.back_office.id
#   default_message_ttl = var.service_bus_config.default_topic_ttl
# }

# # Topics
# resource "azurerm_servicebus_topic" "nsip_project" {
#   name                = var.sb_topic_names.applications.events.nsip_project
#   namespace_id        = azurerm_servicebus_namespace.back_office.id
#   default_message_ttl = var.service_bus_config.default_topic_ttl
# }

# resource "azurerm_servicebus_topic" "nsip_project_update" {
#   name                = var.sb_topic_names.applications.events.nsip_project_update
#   namespace_id        = azurerm_servicebus_namespace.back_office.id
#   default_message_ttl = var.service_bus_config.default_topic_ttl
# }

# resource "azurerm_servicebus_topic" "nsip_documents" {
#   name                = var.sb_topic_names.applications.events.nsip_documents
#   namespace_id        = azurerm_servicebus_namespace.back_office.id
#   default_message_ttl = var.service_bus_config.default_topic_ttl
# }

# resource "azurerm_servicebus_topic" "folders" {
#   name                = var.sb_topic_names.applications.events.folders
#   namespace_id        = azurerm_servicebus_namespace.back_office.id
#   default_message_ttl = var.service_bus_config.default_topic_ttl
# }

# resource "azurerm_servicebus_topic" "nsip_subscription" {
#   name                = var.sb_topic_names.applications.events.nsip_subscription
#   namespace_id        = azurerm_servicebus_namespace.back_office.id
#   default_message_ttl = var.service_bus_config.default_topic_ttl
# }

# resource "azurerm_servicebus_topic" "nsip_exam_timetable" {
#   name                = var.sb_topic_names.applications.events.nsip_exam_timetable
#   namespace_id        = azurerm_servicebus_namespace.back_office.id
#   default_message_ttl = var.service_bus_config.default_topic_ttl
# }

# resource "azurerm_servicebus_topic" "nsip_representation" {
#   name                = var.sb_topic_names.applications.events.nsip_representation
#   namespace_id        = azurerm_servicebus_namespace.back_office.id
#   default_message_ttl = var.service_bus_config.default_topic_ttl
# }

# resource "azurerm_servicebus_topic" "nsip_s51_advice" {
#   name                = var.sb_topic_names.applications.events.nsip_s51_advice
#   namespace_id        = azurerm_servicebus_namespace.back_office.id
#   default_message_ttl = var.service_bus_config.default_topic_ttl
# }

# # Commands
# resource "azurerm_servicebus_topic" "register_nsip_subscription" {
#   name                = var.sb_topic_names.applications.commands.register_nsip_subscription
#   namespace_id        = azurerm_servicebus_namespace.back_office.id
#   default_message_ttl = var.service_bus_config.default_topic_ttl
# }

# resource "azurerm_servicebus_topic" "register_representation" {
#   name                = var.sb_topic_names.applications.commands.register_representation
#   namespace_id        = azurerm_servicebus_namespace.back_office.id
#   default_message_ttl = var.service_bus_config.default_topic_ttl
# }

# resource "azurerm_servicebus_topic" "deadline_submission_topic" {
#   name                = var.sb_topic_names.applications.commands.deadline_submission_topic
#   namespace_id        = azurerm_servicebus_namespace.back_office.id
#   default_message_ttl = var.service_bus_config.default_topic_ttl
# }

# resource "azurerm_servicebus_topic" "deadline_submission_result" {
#   name                = var.sb_topic_names.applications.commands.deadline_submission_result
#   namespace_id        = azurerm_servicebus_namespace.back_office.id
#   default_message_ttl = var.service_bus_config.default_topic_ttl
# }

# # Appeals FO Producers (Commands)
# resource "azurerm_servicebus_topic" "appeal_fo_appellant_submission" {
#   name                = var.sb_topic_names.appeals.commands.appellant_submission
#   namespace_id        = azurerm_servicebus_namespace.back_office.id
#   default_message_ttl = var.service_bus_config.default_topic_ttl
# }

# resource "azurerm_servicebus_topic" "appeal_fo_lpa_response_submission" {
#   name                = var.sb_topic_names.appeals.commands.lpa_response_submission
#   namespace_id        = azurerm_servicebus_namespace.back_office.id
#   default_message_ttl = var.service_bus_config.default_topic_ttl
# }

# resource "azurerm_servicebus_topic" "listed_building" {
#   name                = var.sb_topic_names.appeals.commands.listed_building
#   namespace_id        = azurerm_servicebus_namespace.back_office.id
#   default_message_ttl = var.service_bus_config.default_topic_ttl
# }

# # Appeals BO Producers (Events)
# resource "azurerm_servicebus_topic" "appeal_bo_case" {
#   name                = var.sb_topic_names.appeals.events.case
#   namespace_id        = azurerm_servicebus_namespace.back_office.id
#   default_message_ttl = var.service_bus_config.default_topic_ttl
# }

# resource "azurerm_servicebus_topic" "appeal_bo_document" {
#   name                = var.sb_topic_names.appeals.events.document
#   namespace_id        = azurerm_servicebus_namespace.back_office.id
#   default_message_ttl = var.service_bus_config.default_topic_ttl
# }

# resource "azurerm_servicebus_topic" "appeal_bo_document_to_move" {
#   name                = var.sb_topic_names.appeals.events.document_to_move
#   namespace_id        = azurerm_servicebus_namespace.back_office.id
#   default_message_ttl = var.service_bus_config.default_topic_ttl
# }
