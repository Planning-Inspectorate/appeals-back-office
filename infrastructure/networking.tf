resource "azurerm_virtual_network" "main" {
  name                = "${local.org}-vnet-${local.resource_suffix}"
  location            = module.primary_region.location
  resource_group_name = azurerm_resource_group.primary.name
  address_space       = [var.vnet_config.address_space]

  tags = var.tags
}

resource "azurerm_subnet" "apps" {
  name                              = "${local.org}-snet-${local.service_name}-apps-${var.environment}"
  resource_group_name               = azurerm_resource_group.primary.name
  virtual_network_name              = azurerm_virtual_network.main.name
  address_prefixes                  = [var.vnet_config.apps_subnet_address_space]
  private_endpoint_network_policies = "Enabled"

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
  name                              = "${local.org}-snet-${local.resource_suffix}"
  resource_group_name               = azurerm_resource_group.primary.name
  virtual_network_name              = azurerm_virtual_network.main.name
  address_prefixes                  = [var.vnet_config.main_subnet_address_space]
  private_endpoint_network_policies = "Enabled"
}

## peer to tooling VNET for DevOps agents
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

## peer to front office for Service Bus connection
resource "azurerm_virtual_network_peering" "bo_to_front_office" {
  # only deploy if configured to connect to front office
  count = var.front_office_infra_config.deploy_connections ? 1 : 0

  name                      = "${local.org}-peer-${local.service_name}-to-front-office-${var.environment}"
  remote_virtual_network_id = data.azurerm_virtual_network.front_office_vnet[0].id
  resource_group_name       = azurerm_virtual_network.main.resource_group_name
  virtual_network_name      = azurerm_virtual_network.main.name
}

resource "azurerm_virtual_network_peering" "front_office_to_bo" {
  # only deploy if configured to connect to front office
  count = var.front_office_infra_config.deploy_connections ? 1 : 0

  name                      = "${local.org}-peer-front-office-to-${local.service_name}-${var.environment}"
  remote_virtual_network_id = azurerm_virtual_network.main.id
  resource_group_name       = var.front_office_infra_config.network.rg
  virtual_network_name      = var.front_office_infra_config.network.name
}

## peer to Horizon for linked case integration
resource "azurerm_virtual_network_peering" "bo_to_horizon" {
  # only deploy if configured to connect to horizon
  count = var.horizon_infra_config.deploy_connections ? 1 : 0

  name                      = "${local.org}-peer-${local.service_name}-to-horizon-${var.environment}"
  remote_virtual_network_id = data.azurerm_virtual_network.horizon_vnet[0].id
  resource_group_name       = azurerm_virtual_network.main.resource_group_name
  virtual_network_name      = azurerm_virtual_network.main.name
}

resource "azurerm_virtual_network_peering" "horizon_to_bo" {
  # only deploy if configured to connect to horizon
  count = var.horizon_infra_config.deploy_connections ? 1 : 0

  name                      = "${local.org}-peer-horizon-to-${local.service_name}-${var.environment}"
  remote_virtual_network_id = azurerm_virtual_network.main.id
  resource_group_name       = var.horizon_infra_config.network.rg
  virtual_network_name      = var.horizon_infra_config.network.name

  provider = azurerm.horizon
}

# peering test and staging environment
resource "azurerm_virtual_network_peering" "stage_to_test_environment" {
  # only deploy if in staging environment
  count = var.environment == "staging" ? 1 : 0

  name                      = "${local.org}-peer-${local.service_name}-test-abo--${var.environment}"
  remote_virtual_network_id = data.azurerm_virtual_network.vnet_primary_test[0].id #test env vnet data source
  resource_group_name       = azurerm_virtual_network.main.resource_group_name
  virtual_network_name      = azurerm_virtual_network.main.name # staging env vnet
}

resource "azurerm_virtual_network_peering" "test_environment_to_stage" {
  # only deploy if in staging environment
  count = var.environment == "staging" ? 1 : 0

  name                      = "${local.org}-peer-abo-test-to-${local.service_name}-${var.environment}"
  remote_virtual_network_id = azurerm_virtual_network.main.id # staging env vnet
  resource_group_name       = var.service_bus_shared.resource_group_name
  virtual_network_name      = var.service_bus_shared.network_name # test env vnet data source
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
  resource_group_name   = var.tooling_config.network_rg
  private_dns_zone_name = data.azurerm_private_dns_zone.app_config.name
  virtual_network_id    = azurerm_virtual_network.main.id

  provider = azurerm.tooling
}

data "azurerm_private_dns_zone" "app_service" {
  name                = "privatelink.azurewebsites.net"
  resource_group_name = var.tooling_config.network_rg

  provider = azurerm.tooling
}
resource "azurerm_private_dns_zone_virtual_network_link" "app_service" {
  name                  = "${local.org}-vnetlink-app-service-${local.resource_suffix}"
  resource_group_name   = var.tooling_config.network_rg
  private_dns_zone_name = data.azurerm_private_dns_zone.app_service.name
  virtual_network_id    = azurerm_virtual_network.main.id

  provider = azurerm.tooling
}

data "azurerm_private_dns_zone" "database" {
  name                = "privatelink.database.windows.net"
  resource_group_name = var.tooling_config.network_rg

  provider = azurerm.tooling
}
resource "azurerm_private_dns_zone_virtual_network_link" "database" {
  name                  = "${local.org}-vnetlink-db-${local.resource_suffix}"
  resource_group_name   = var.tooling_config.network_rg
  private_dns_zone_name = data.azurerm_private_dns_zone.database.name
  virtual_network_id    = azurerm_virtual_network.main.id

  provider = azurerm.tooling
}

data "azurerm_private_dns_zone" "redis_cache" {
  name                = "privatelink.redis.cache.windows.net"
  resource_group_name = var.tooling_config.network_rg

  provider = azurerm.tooling
}
resource "azurerm_private_dns_zone_virtual_network_link" "redis_cache" {
  name                  = "${local.org}-vnetlink-redis-cache-${local.resource_suffix}"
  resource_group_name   = var.tooling_config.network_rg
  private_dns_zone_name = data.azurerm_private_dns_zone.redis_cache.name
  virtual_network_id    = azurerm_virtual_network.main.id

  provider = azurerm.tooling
}

data "azurerm_private_dns_zone" "service_bus" {
  name                = "privatelink.servicebus.windows.net"
  resource_group_name = var.tooling_config.network_rg

  provider = azurerm.tooling
}
resource "azurerm_private_dns_zone_virtual_network_link" "service_bus" {
  name                  = "${local.org}-vnetlink-service-bus-${local.resource_suffix}"
  resource_group_name   = var.tooling_config.network_rg
  private_dns_zone_name = data.azurerm_private_dns_zone.service_bus.name
  virtual_network_id    = azurerm_virtual_network.main.id

  provider = azurerm.tooling
}

data "azurerm_private_dns_zone" "synapse" {
  name                = "privatelink.sql.azuresynapse.net"
  resource_group_name = var.tooling_config.network_rg

  provider = azurerm.tooling
}
resource "azurerm_private_dns_zone_virtual_network_link" "synapse" {
  name                  = "${local.org}-vnetlink-synapse-${local.resource_suffix}"
  resource_group_name   = var.tooling_config.network_rg
  private_dns_zone_name = data.azurerm_private_dns_zone.synapse.name
  virtual_network_id    = azurerm_virtual_network.main.id

  provider = azurerm.tooling
}
