resource "azurerm_subnet" "back_office_ingress" {
  name                                      = "pins-snet-${local.service_name}-ingress-${local.resource_suffix}"
  resource_group_name                       = var.common_resource_group_name
  virtual_network_name                      = var.common_vnet_name
  address_prefixes                          = [var.common_vnet_cidr_blocks["back_office_endpoints"]]
  private_endpoint_network_policies_enabled = true
}
