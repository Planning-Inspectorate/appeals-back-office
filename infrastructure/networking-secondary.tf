resource "azurerm_virtual_network" "secondary" {
  name                = "${local.org}-vnet-${local.secondary_resource_suffix}"
  location            = module.secondary_region.location
  resource_group_name = azurerm_resource_group.secondary.name
  address_space       = [var.vnet_config.secondary_address_space]

  tags = var.tags
}

resource "azurerm_subnet" "secondary_apps" {
  name                 = "${local.org}-snet-${local.service_name}-apps-secondary-${var.environment}"
  resource_group_name  = azurerm_resource_group.secondary.name
  virtual_network_name = azurerm_virtual_network.secondary.name
  address_prefixes     = [var.vnet_config.secondary_apps_subnet_address_space]

  # for app services
  delegation {
    name = "delegation"

    service_delegation {
      name = "Microsoft.Web/serverFarms"
      actions = [
        "Microsoft.Network/virtualNetworks/subnets/action"
      ]
    }
  }
}

resource "azurerm_subnet" "secondary" {
  name                 = "${local.org}-snet-${local.secondary_resource_suffix}"
  resource_group_name  = azurerm_resource_group.secondary.name
  virtual_network_name = azurerm_virtual_network.secondary.name
  address_prefixes     = [var.vnet_config.secondary_subnet_address_space]
}

resource "azurerm_virtual_network_peering" "secondary_bo_to_tooling" {
  name                      = "${local.org}-peer-${local.service_name}-secondary-to-tooling-${var.environment}"
  remote_virtual_network_id = data.azurerm_virtual_network.tooling.id
  resource_group_name       = azurerm_virtual_network.secondary.resource_group_name
  virtual_network_name      = azurerm_virtual_network.secondary.name
}

resource "azurerm_virtual_network_peering" "secondary_tooling_to_bo" {
  name                      = "${local.org}-peer-tooling-to-${local.secondary_resource_suffix}"
  remote_virtual_network_id = azurerm_virtual_network.secondary.id
  resource_group_name       = var.tooling_config.network_rg
  virtual_network_name      = var.tooling_config.network_name

  provider = azurerm.tooling
}

## DNS Zones for Azure Services
## the DNS Zones are global, so we link them to both VNets

resource "azurerm_private_dns_zone_virtual_network_link" "secondary_app_config" {
  name                  = "${local.org}-vnetlink-app-config-${local.secondary_resource_suffix}"
  resource_group_name   = azurerm_resource_group.primary.name
  private_dns_zone_name = data.azurerm_private_dns_zone.app_config.name
  virtual_network_id    = azurerm_virtual_network.secondary.id
}

resource "azurerm_private_dns_zone_virtual_network_link" "secondary_app_service" {
  name                  = "${local.org}-vnetlink-app-service-${local.secondary_resource_suffix}"
  resource_group_name   = azurerm_resource_group.primary.name
  private_dns_zone_name = data.azurerm_private_dns_zone.app_service.name
  virtual_network_id    = azurerm_virtual_network.secondary.id
}

resource "azurerm_private_dns_zone_virtual_network_link" "secondary_database" {
  name                  = "${local.org}-vnetlink-db-${local.secondary_resource_suffix}"
  resource_group_name   = azurerm_resource_group.primary.name
  private_dns_zone_name = data.azurerm_private_dns_zone.database.name
  virtual_network_id    = azurerm_virtual_network.secondary.id
}

resource "azurerm_private_dns_zone_virtual_network_link" "secondary_redis_cache" {
  name                  = "${local.org}-vnetlink-redis-cache-${local.secondary_resource_suffix}"
  resource_group_name   = azurerm_resource_group.primary.name
  private_dns_zone_name = data.azurerm_private_dns_zone.redis_cache.name
  virtual_network_id    = azurerm_virtual_network.secondary.id
}

resource "azurerm_private_dns_zone_virtual_network_link" "secondary_service_bus" {
  name                  = "${local.org}-vnetlink-service-bus-${local.secondary_resource_suffix}"
  resource_group_name   = azurerm_resource_group.primary.name
  private_dns_zone_name = data.azurerm_private_dns_zone.service_bus.name
  virtual_network_id    = azurerm_virtual_network.secondary.id
}

resource "azurerm_private_dns_zone_virtual_network_link" "secondary_synapse" {
  name                  = "${local.org}-vnetlink-synapse-${local.secondary_resource_suffix}"
  resource_group_name   = azurerm_resource_group.primary.name
  private_dns_zone_name = data.azurerm_private_dns_zone.synapse.name
  virtual_network_id    = azurerm_virtual_network.secondary.id
}
