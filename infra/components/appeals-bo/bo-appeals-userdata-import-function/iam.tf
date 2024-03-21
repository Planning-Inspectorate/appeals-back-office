resource "azurerm_role_assignment" "service_bus_data_receiver_service_user" {
  scope                = azurerm_servicebus_subscription.register_odw_serviceuser_subscription.id
  role_definition_name = "Azure Service Bus Data Receiver"
  principal_id         = module.bo_appeals_user_import_function.principal_id
}
