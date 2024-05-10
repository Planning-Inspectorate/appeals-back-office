resource "azurerm_virtual_network" "main" {
  name                = "${local.org}-vnet-${local.resource_suffix}"
  location            = module.primary_region.location
  resource_group_name = azurerm_resource_group.primary.name
  address_space       = [var.vnet_config.address_space]

  tags = var.tags
}

resource "azurerm_subnet" "apps" {
  name                 = "${local.org}-snet-${local.service_name}-apps-${var.environment}"
  resource_group_name  = azurerm_resource_group.primary.name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = [var.vnet_config.apps_subnet_address_space]

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

resource "azurerm_subnet" "main" {
  name                 = "${local.org}-snet-${local.resource_suffix}"
  resource_group_name  = azurerm_resource_group.primary.name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = [var.vnet_config.main_subnet_address_space]
}

resource "azurerm_virtual_network_peering" "bo_to_tooling" {
  name                      = "${local.org}-peer-${local.service_name}-to-tooling-${var.environment}"
  remote_virtual_network_id = data.azurerm_virtual_network.tooling.id
  resource_group_name       = azurerm_virtual_network.main.resource_group_name
  virtual_network_name      = azurerm_virtual_network.main.name
}

resource "azurerm_virtual_network_peering" "tooling_to_bo" {
  name                      = "${local.org}-peer-tooling-to-${local.service_name}-${var.environment}"
  remote_virtual_network_id = azurerm_virtual_network.main.id
  resource_group_name       = var.tooling_config.network_rg
  virtual_network_name      = var.tooling_config.network_name

  provider = azurerm.tooling
}

## DNS Zones for Azure Services
## Private DNS Zones exist in the tooling subscription and are shared
## here we link them to the VNet

data "azurerm_private_dns_zone" "app_config" {
  name                = "privatelink.azconfig.io"
  resource_group_name = var.tooling_config.network_rg

  provider = azurerm.tooling
}
resource "azurerm_private_dns_zone_virtual_network_link" "app_config" {
  name                  = "${local.org}-vnetlink-app-config-${local.resource_suffix}"
  resource_group_name   = azurerm_resource_group.primary.name
  private_dns_zone_name = data.azurerm_private_dns_zone.app_config.name
  virtual_network_id    = azurerm_virtual_network.main.id
}

data "azurerm_private_dns_zone" "app_service" {
  name                = "privatelink.azurewebsites.net"
  resource_group_name = var.tooling_config.network_rg

  provider = azurerm.tooling
}
resource "azurerm_private_dns_zone_virtual_network_link" "app_service" {
  name                  = "${local.org}-vnetlink-app-service-${local.resource_suffix}"
  resource_group_name   = azurerm_resource_group.primary.name
  private_dns_zone_name = data.azurerm_private_dns_zone.app_service.name
  virtual_network_id    = azurerm_virtual_network.main.id
}

data "azurerm_private_dns_zone" "database" {
  name                = "privatelink.database.windows.net"
  resource_group_name = var.tooling_config.network_rg

  provider = azurerm.tooling
}
resource "azurerm_private_dns_zone_virtual_network_link" "database" {
  name                  = "${local.org}-vnetlink-db-${local.resource_suffix}"
  resource_group_name   = azurerm_resource_group.primary.name
  private_dns_zone_name = data.azurerm_private_dns_zone.database.name
  virtual_network_id    = azurerm_virtual_network.main.id
}

data "azurerm_private_dns_zone" "redis_cache" {
  name                = "privatelink.redis.cache.windows.net"
  resource_group_name = var.tooling_config.network_rg

  provider = azurerm.tooling
}
resource "azurerm_private_dns_zone_virtual_network_link" "redis_cache" {
  name                  = "${local.org}-vnetlink-redis-cache-${local.resource_suffix}"
  resource_group_name   = azurerm_resource_group.primary.name
  private_dns_zone_name = data.azurerm_private_dns_zone.redis_cache.name
  virtual_network_id    = azurerm_virtual_network.main.id
}

data "azurerm_private_dns_zone" "service_bus" {
  name                = "privatelink.servicebus.windows.net"
  resource_group_name = var.tooling_config.network_rg

  provider = azurerm.tooling
}
resource "azurerm_private_dns_zone_virtual_network_link" "service_bus" {
  name                  = "${local.org}-vnetlink-service-bus-${local.resource_suffix}"
  resource_group_name   = azurerm_resource_group.primary.name
  private_dns_zone_name = data.azurerm_private_dns_zone.service_bus.name
  virtual_network_id    = azurerm_virtual_network.main.id
}


data "azurerm_private_dns_zone" "synapse" {
  name                = "privatelink.sql.azuresynapse.net"
  resource_group_name = var.tooling_config.network_rg

  provider = azurerm.tooling
}
resource "azurerm_private_dns_zone_virtual_network_link" "synapse" {
  name                  = "${local.org}-vnetlink-synapse-${local.resource_suffix}"
  resource_group_name   = azurerm_resource_group.primary.name
  private_dns_zone_name = data.azurerm_private_dns_zone.synapse.name
  virtual_network_id    = azurerm_virtual_network.main.id
}