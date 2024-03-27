resource "azurerm_servicebus_namespace" "back_office" {
  #checkov:skip=CKV_AZURE_199: TODO: Ensure that Azure Service Bus uses double encryption
  #checkov:skip=CKV_AZURE_201: TODO: Ensure that Azure Service Bus uses a customer-managed key to encrypt data
  #checkov:skip=CKV_AZURE_202: TODO: Ensure that Managed identity provider is enabled for Azure Service Bus
  #checkov:skip=CKV_AZURE_203: TODO: Ensure Azure Service Bus Local Authentication is disabled
  #checkov:skip=CKV_AZURE_204: TODO: public network access enabled' is set to 'False' for Azure Service Bus
  #checkov:skip=CKV_AZURE_205: TODO: Ensure Azure Service Bus is using the latest version of TLS encryption
  name                          = "pins-sb-${local.service_name}-${local.resource_suffix}"
  location                      = azurerm_resource_group.back_office_stack.location
  resource_group_name           = azurerm_resource_group.back_office_stack.name
  sku                           = var.service_bus_failover_enabled ? "Premium" : "Standard"
  capacity                      = var.service_bus_failover_enabled ? 1 : 0
  public_network_access_enabled = !var.service_bus_failover_enabled

  tags = local.tags
}

# Create a private DNS zone for the SB private endpoint
resource "azurerm_private_dns_zone" "back_office" {
  count = var.service_bus_failover_enabled ? 1 : 0

  name                = "privatelink.servicebus.windows.net"
  resource_group_name = azurerm_resource_group.back_office_stack.name
}

resource "azurerm_private_dns_zone_virtual_network_link" "back_office" {
  count = var.service_bus_failover_enabled ? 1 : 0

  name                  = "service-bus-dns-link"
  resource_group_name   = azurerm_resource_group.back_office_stack.name
  private_dns_zone_name = azurerm_private_dns_zone.back_office[0].name
  virtual_network_id    = var.common_vnet_id
}


# Create a private endpoint for the namespace
resource "azurerm_private_endpoint" "back_office" {
  count = var.service_bus_failover_enabled ? 1 : 0

  name                = "pins-pe-${local.service_name}-sb-${local.resource_suffix}"
  location            = azurerm_resource_group.back_office_stack.location
  resource_group_name = azurerm_resource_group.back_office_stack.name
  subnet_id           = azurerm_subnet.back_office_ingress.id

  private_dns_zone_group {
    name                 = "pins-pdns-${local.service_name}-sb-${local.resource_suffix}"
    private_dns_zone_ids = [azurerm_private_dns_zone.back_office[0].id]
  }

  private_service_connection {
    name                           = "pins-psc-${local.service_name}-sb-${local.resource_suffix}"
    private_connection_resource_id = azurerm_servicebus_namespace.back_office.id
    is_manual_connection           = false
    subresource_names              = ["namespace"]
  }

  tags = local.tags
}

# Common Topics
resource "azurerm_servicebus_topic" "service_user" {
  name                = var.sb_topic_names.common.service_user
  namespace_id        = azurerm_servicebus_namespace.back_office.id
  default_message_ttl = var.service_bus_config.default_topic_ttl
}

resource "azurerm_servicebus_topic" "listed_building" {
  name                = var.sb_topic_names.appeals.commands.listed_building
  namespace_id        = azurerm_servicebus_namespace.back_office.id
  default_message_ttl = var.service_bus_config.default_topic_ttl
}

# Appeals FO Producers (Commands)
resource "azurerm_servicebus_topic" "appeal_fo_appellant_submission" {
  name                = var.sb_topic_names.appeals.commands.appellant_submission
  namespace_id        = azurerm_servicebus_namespace.back_office.id
  default_message_ttl = var.service_bus_config.default_topic_ttl
}

resource "azurerm_servicebus_topic" "appeal_fo_lpa_response_submission" {
  name                = var.sb_topic_names.appeals.commands.lpa_response_submission
  namespace_id        = azurerm_servicebus_namespace.back_office.id
  default_message_ttl = var.service_bus_config.default_topic_ttl
}

# Appeals BO Producers (Events)
resource "azurerm_servicebus_topic" "appeal_bo_case" {
  name                = var.sb_topic_names.appeals.events.case
  namespace_id        = azurerm_servicebus_namespace.back_office.id
  default_message_ttl = var.service_bus_config.default_topic_ttl
}

resource "azurerm_servicebus_topic" "appeal_bo_document" {
  name                = var.sb_topic_names.appeals.events.document
  namespace_id        = azurerm_servicebus_namespace.back_office.id
  default_message_ttl = var.service_bus_config.default_topic_ttl
}

resource "azurerm_servicebus_topic" "appeal_bo_document_to_move" {
  name                = var.sb_topic_names.appeals.events.document_to_move
  namespace_id        = azurerm_servicebus_namespace.back_office.id
  default_message_ttl = var.service_bus_config.default_topic_ttl
}
