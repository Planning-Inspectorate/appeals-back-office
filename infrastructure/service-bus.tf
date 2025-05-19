resource "azurerm_servicebus_namespace" "main" {
  #checkov:skip=CKV_AZURE_199: TODO: Ensure that Azure Service Bus uses double encryption
  #checkov:skip=CKV_AZURE_201: TODO: Ensure that Azure Service Bus uses a customer-managed key to encrypt data
  #checkov:skip=CKV_AZURE_204: public network access only enabled in dev
  name                = "${local.org}-sb-${local.resource_suffix}"
  resource_group_name = azurerm_resource_group.primary.name
  location            = module.primary_region.location

  sku                          = var.service_bus_config.sku
  capacity                     = var.service_bus_config.capacity
  premium_messaging_partitions = var.service_bus_config.sku == "Premium" ? 1 : 0

  minimum_tls_version           = "1.2"
  public_network_access_enabled = var.service_bus_config.public_network_access_enabled
  local_auth_enabled            = false

  identity {
    type = "SystemAssigned"
  }

  tags = local.tags
}

resource "azurerm_private_endpoint" "sb_main" {
  count = var.service_bus_config.sku == "Premium" ? 1 : 0

  name                = "pins-pe-${local.service_name}-sb-${var.environment}"
  resource_group_name = azurerm_resource_group.primary.name
  location            = module.primary_region.location
  subnet_id           = azurerm_subnet.main.id

  private_dns_zone_group {
    name                 = "pins-pdns-${local.service_name}-sb-${var.environment}"
    private_dns_zone_ids = [data.azurerm_private_dns_zone.service_bus.id]
  }

  private_service_connection {
    name                           = "pins-psc-${local.service_name}-sb-${var.environment}"
    private_connection_resource_id = azurerm_servicebus_namespace.main.id
    is_manual_connection           = false
    subresource_names              = ["namespace"]
  }

  tags = local.tags
}

## Front office submission topics

resource "azurerm_servicebus_topic" "appeal_fo_appellant_submission" {
  name                = var.sb_topic_names.submissions.appellant
  namespace_id        = azurerm_servicebus_namespace.main.id
  default_message_ttl = var.sb_ttl.default
}

resource "azurerm_servicebus_topic" "appeal_fo_lpa_questionnaire_submission" {
  name                = var.sb_topic_names.submissions.lpa_questionnaire
  namespace_id        = azurerm_servicebus_namespace.main.id
  default_message_ttl = var.sb_ttl.default
}

resource "azurerm_servicebus_topic" "appeal_fo_representation_submission" {
  name                = var.sb_topic_names.submissions.representation
  namespace_id        = azurerm_servicebus_namespace.main.id
  default_message_ttl = var.sb_ttl.default
}

## Back office broadcast topics

resource "azurerm_servicebus_topic" "appeal_has" {
  name                = var.sb_topic_names.events.appeal_has
  namespace_id        = azurerm_servicebus_namespace.main.id
  default_message_ttl = var.sb_ttl.default
}

resource "azurerm_servicebus_topic" "appeal_s78" {
  name                = var.sb_topic_names.events.appeal_s78
  namespace_id        = azurerm_servicebus_namespace.main.id
  default_message_ttl = var.sb_ttl.default
}

resource "azurerm_servicebus_topic" "appeal_document" {
  name                = var.sb_topic_names.events.document
  namespace_id        = azurerm_servicebus_namespace.main.id
  default_message_ttl = var.sb_ttl.default
}

resource "azurerm_servicebus_topic" "appeal_event" {
  name                = var.sb_topic_names.events.event
  namespace_id        = azurerm_servicebus_namespace.main.id
  default_message_ttl = var.sb_ttl.default
}

resource "azurerm_servicebus_topic" "service_user" {
  name                = var.sb_topic_names.events.service_user
  namespace_id        = azurerm_servicebus_namespace.main.id
  default_message_ttl = var.sb_ttl.default
}

resource "azurerm_servicebus_topic" "appeal_representation" {
  name                = var.sb_topic_names.events.appeal_representation
  namespace_id        = azurerm_servicebus_namespace.main.id
  default_message_ttl = var.sb_ttl.default
}

resource "azurerm_servicebus_topic" "appeal_event_estimate" {
  name                = var.sb_topic_names.events.appeal_event_estimate
  namespace_id        = azurerm_servicebus_namespace.main.id
  default_message_ttl = var.sb_ttl.default
}

## Back office internal topics

resource "azurerm_servicebus_topic" "appeal_document_to_move" {
  name                = var.sb_topic_names.events.document_to_move
  namespace_id        = azurerm_servicebus_namespace.main.id
  default_message_ttl = var.sb_ttl.default
}

resource "azurerm_servicebus_topic" "listed_building" {
  name                = var.sb_topic_names.events.listed_building
  namespace_id        = azurerm_servicebus_namespace.main.id
  default_message_ttl = var.sb_ttl.default
}
