locals {
  service_bus = var.service_bus_shared.use_sb_test ? {
    id   = data.azurerm_servicebus_namespace.test_sb[0].id
    name = data.azurerm_servicebus_namespace.test_sb[0].name
    } : {
    id   = azurerm_servicebus_namespace.main[0].id
    name = azurerm_servicebus_namespace.main[0].name
  }
}

data "azurerm_servicebus_namespace" "test_sb" {
  count = var.service_bus_shared.use_sb_test ? 1 : 0

  name                = var.service_bus_shared.name
  resource_group_name = var.service_bus_shared.resource_group_name
}

resource "azurerm_servicebus_namespace" "main" {
  #checkov:skip=CKV_AZURE_199: TODO: Ensure that Azure Service Bus uses double encryption
  #checkov:skip=CKV_AZURE_201: TODO: Ensure that Azure Service Bus uses a customer-managed key to encrypt data
  #checkov:skip=CKV_AZURE_204: public network access only enabled in dev
  count = var.service_bus_shared.use_sb_test ? 0 : 1

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
  count = var.service_bus_config.sku == "Premium" && !var.service_bus_shared.use_sb_test ? 1 : 0

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
    private_connection_resource_id = local.service_bus.id
    is_manual_connection           = false
    subresource_names              = ["namespace"]
  }

  tags = local.tags
}

## Front office submission topics

resource "azurerm_servicebus_topic" "appeal_fo_appellant_submission" {
  name                = var.sb_topic_names.submissions.appellant
  namespace_id        = local.service_bus.id
  default_message_ttl = var.sb_ttl.default
}

resource "azurerm_servicebus_topic" "appeal_fo_lpa_questionnaire_submission" {
  name                = var.sb_topic_names.submissions.lpa_questionnaire
  namespace_id        = local.service_bus.id
  default_message_ttl = var.sb_ttl.default
}

resource "azurerm_servicebus_topic" "appeal_fo_representation_submission" {
  name                = var.sb_topic_names.submissions.representation
  namespace_id        = local.service_bus.id
  default_message_ttl = var.sb_ttl.default
}

## Back office broadcast topics

resource "azurerm_servicebus_topic" "appeal_has" {
  name                = var.sb_topic_names.events.appeal_has
  namespace_id        = local.service_bus.id
  default_message_ttl = var.sb_ttl.default
}

resource "azurerm_servicebus_topic" "appeal_s78" {
  name                = var.sb_topic_names.events.appeal_s78
  namespace_id        = local.service_bus.id
  default_message_ttl = var.sb_ttl.default
}

resource "azurerm_servicebus_topic" "appeal_document" {
  name                = var.sb_topic_names.events.document
  namespace_id        = local.service_bus.id
  default_message_ttl = var.sb_ttl.default
}

resource "azurerm_servicebus_topic" "appeal_event" {
  name                = var.sb_topic_names.events.event
  namespace_id        = local.service_bus.id
  default_message_ttl = var.sb_ttl.default
}

resource "azurerm_servicebus_topic" "service_user" {
  name                = var.sb_topic_names.events.service_user
  namespace_id        = local.service_bus.id
  default_message_ttl = var.sb_ttl.default
}

resource "azurerm_servicebus_topic" "appeal_representation" {
  name                = var.sb_topic_names.events.appeal_representation
  namespace_id        = local.service_bus.id
  default_message_ttl = var.sb_ttl.default
}

resource "azurerm_servicebus_topic" "appeal_event_estimate" {
  name                = var.sb_topic_names.events.appeal_event_estimate
  namespace_id        = local.service_bus.id
  default_message_ttl = var.sb_ttl.default
}

## Back office internal topics

resource "azurerm_servicebus_topic" "appeal_document_to_move" {
  name                = var.sb_topic_names.events.document_to_move
  namespace_id        = local.service_bus.id
  default_message_ttl = var.sb_ttl.default
}

resource "azurerm_servicebus_topic" "listed_building" {
  name                = var.sb_topic_names.events.listed_building
  namespace_id        = local.service_bus.id
  default_message_ttl = var.sb_ttl.default
}
