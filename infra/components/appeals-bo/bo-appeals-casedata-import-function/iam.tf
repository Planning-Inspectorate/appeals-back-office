resource "azurerm_role_assignment" "service_bus_data_receiver_appellant_case" {
  scope                = azurerm_servicebus_subscription.fo_appellant_submission_subscription.id
  role_definition_name = "Azure Service Bus Data Receiver"
  principal_id         = module.bo_appeals_casedata_import_function.principal_id
}

resource "azurerm_role_assignment" "service_bus_data_receiver_lpa_questionnaire" {
  scope                = azurerm_servicebus_subscription.fo_lpaq_submission_subscription.id
  role_definition_name = "Azure Service Bus Data Receiver"
  principal_id         = module.bo_appeals_casedata_import_function.principal_id
}
