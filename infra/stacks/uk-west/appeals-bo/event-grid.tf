resource "azurerm_eventgrid_topic" "malware_scanning_topic" {
  #checkov:skip=CKV_AZURE_192: TODO: Ensure that Azure Event Grid Topic local Authentication is disabled
  #checkov:skip=CKV_AZURE_193: TODO: Ensure public network access is disabled for Azure Event Grid Topic
  name                = "malware-scanning-topic-${local.resource_suffix}"
  resource_group_name = azurerm_resource_group.back_office_stack.name
  location            = azurerm_resource_group.back_office_stack.location

  identity {
    type = "SystemAssigned"
  }
}
