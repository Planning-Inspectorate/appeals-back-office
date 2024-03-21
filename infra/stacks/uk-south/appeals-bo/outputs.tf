output "app_service_urls" {
  description = "A map of frontend app service URLs"
  value       = module.app_services.app_service_urls
}

output "web_frontend_url" {
  description = "The URL of the web frontend app service"
  value       = module.app_services.web_frontend_url
}

output "appeals_web_frontend_url" {
  description = "The URL of the appeals web frontend app service"
  value       = module.app_services.appeals_web_frontend_url
}

output "back_office_document_storage_api_host" {
  description = "The full failover URI to the storage account used for back office documents"
  value       = azurerm_storage_account.back_office_documents.primary_blob_endpoint
}

output "back_office_document_storage_account_name" {
  description = "Name of the storage account used for back office documents"
  value       = azurerm_storage_account.back_office_documents.name
}

output "back_office_document_storage_container_name" {
  description = "The back office blob storage container name"
  value       = azurerm_storage_container.back_office_document_service_uploads_container.name
}

output "document_storage_back_office_document_service_uploads_container_id" {
  description = "Back Office document-service-uploads container id"
  value       = azurerm_storage_container.back_office_document_service_uploads_container.id
}

output "document_storage_back_office_document_service_uploads_container_resource_manager_id" {
  description = "Back Office document-service-uploads container resource_manager_id"
  value       = azurerm_storage_container.back_office_document_service_uploads_container.resource_manager_id
}

output "back_office_submissions_storage_container_name" {
  description = "Back office submissions container name"
  value       = azurerm_storage_container.back_office_submissions_container.name
}

output "back_office_submissions_storage_container_id" {
  description = "Back office submissions container ID"
  value       = azurerm_storage_container.back_office_submissions_container.id
}

output "back_office_submissions_storage_container_resource_manager_id" {
  description = "Back office submissions container resource_manager_id"
  value       = azurerm_storage_container.back_office_submissions_container.resource_manager_id
}

output "document_storage_back_office_published_documents_container_resource_manager_id" {
  description = "Back Office published-documents container id"
  value       = azurerm_storage_container.back_office_published_documents_container.resource_manager_id
}

output "document_storage_back_office_document_service_uploads_container_name" {
  description = "Back Office document-service-uploads container name"
  value       = azurerm_storage_container.back_office_document_service_uploads_container.name
}

output "bo_storage_account_id" {
  description = "Back Office storage account id"
  value       = azurerm_storage_account.back_office_documents.id
}

output "bo_appeals_document_container_id" {
  description = "Back Office appeals container resource_manager_id"
  value       = azurerm_storage_container.back_office_appeals_document_container.resource_manager_id
}

output "bo_appeals_document_container_name" {
  description = "Back Office appeals container resource_manager_id"
  value       = azurerm_storage_container.back_office_appeals_document_container.name
}

output "back_office_service_bus_connection_string" {
  description = "Connection strong for Azure Service Bus in Back Office"
  value       = azurerm_servicebus_namespace.back_office.default_primary_connection_string
  sensitive   = true
}

output "back_office_sql_database" {
  description = "The ID of the Back Office SQL database"
  value       = azurerm_mssql_database.back_office.id
}

output "back_office_appeals_sql_database" {
  description = "The ID of the Back Office Appeals SQL database"
  value       = azurerm_mssql_database.back_office_appeals.id
}

output "document_check_function_storage_name" {
  description = "Function Storage name"
  value       = azurerm_storage_account.function_storage.name
}

output "document_check_function_storage_primary_access_key" {
  description = "Function Storage Primary Access Key"
  value       = azurerm_storage_account.function_storage.primary_access_key
  sensitive   = true
}

output "function_apps_storage_account" {
  description = "Function app storage account"
  value       = azurerm_storage_account.function_storage.name
}

output "function_apps_storage_account_access_key" {
  description = "Function app storage account access key"
  sensitive   = true
  value       = azurerm_storage_account.function_storage.primary_access_key
}

output "service_bus_namespace_id" {
  description = "The ID of the Service Bus Namespace"
  value       = azurerm_servicebus_namespace.back_office.id
}

output "service_bus_namespace_name" {
  description = "The name of the Service Bus Namespace"
  value       = azurerm_servicebus_namespace.back_office.name
}

output "servicebus_topic_service_user_id" {
  description = "Service Bus Topic service-user id. Only used by ODW."
  value       = azurerm_servicebus_topic.service_user.id
}

output "servicebus_topic_folders_id" {
  description = "Service Bus Topic folder id"
  value       = azurerm_servicebus_topic.folders.id
}

output "servicebus_topic_nsip_documents_id" {
  description = "Service Bus Topic nsip-document id"
  value       = azurerm_servicebus_topic.nsip_documents.id
}

output "service_bus_nsip_project_topic_id" {
  description = "ID of the nsip-project Service Bus Topic"
  value       = azurerm_servicebus_topic.nsip_project.id
}

output "service_bus_nsip_exam_timetable_id" {
  description = "ID of the nsip-exam-timetable Service Bus Topic"
  value       = azurerm_servicebus_topic.nsip_exam_timetable.id
}

output "service_bus_nsip_s51_advice_topic_id" {
  description = "ID of the nsip-s51-advice Service Bus Topic"
  value       = azurerm_servicebus_topic.nsip_s51_advice.id
}


output "service_bus_nsip_representation_id" {
  description = "ID of the nsip-representation Service Bus Topic"
  value       = azurerm_servicebus_topic.nsip_representation.id
}

output "service_bus_appeals_bo_case_topic_id" {
  description = "ID of the appeals back office case Service Bus Topic"
  value       = azurerm_servicebus_topic.appeal_bo_case.id
}

output "service_bus_appeals_fo_lpa_response_submission_topic_id" {
  description = "ID of the appeals front office lpa response submission Service Bus Topic"
  value       = azurerm_servicebus_topic.appeal_fo_lpa_response_submission.id
}

output "service_bus_appeals_fo_appellant_submission_topic_id" {
  description = "ID of the appeals front office appellant submission Service Bus Topic"
  value       = azurerm_servicebus_topic.appeal_fo_appellant_submission.id
}

output "service_bus_appeals_bo_document_topic_id" {
  description = "ID of the appeals back office document Service Bus Topic"
  value       = azurerm_servicebus_topic.appeal_bo_document.id
}

output "service_bus_appeals_bo_document_to_move_topic_id" {
  description = "ID of the appeals back office document to move Service Bus Topic"
  value       = azurerm_servicebus_topic.appeal_bo_document_to_move.id
}

output "service_bus_appeals_fo_appellant_submission_id" {
  description = "ID of the appeals front office appellant case Service Bus Topic"
  value       = azurerm_servicebus_topic.appeal_fo_appellant_submission.id
}

output "service_bus_appeals_fo_lpa_response_submission_id" {
  description = "ID of the appeals front office LPA response Service Bus Topic"
  value       = azurerm_servicebus_topic.appeal_fo_lpa_response_submission.id
}

output "servicebus_topic_register_nsip_subscription_id" {
  description = "Service Bus Topic register_nsip_subscription id"
  value       = azurerm_servicebus_topic.register_nsip_subscription.id
}

output "servicebus_topic_register_representation_id" {
  description = "Service Bus Topic register-representation id"
  value       = azurerm_servicebus_topic.register_representation.id
}

output "servicebus_topic_deadline_submission_topic_id" {
  description = "Service Bus Topic deadline_submission_topic id"
  value       = azurerm_servicebus_topic.deadline_submission_topic.id
}

output "servicebus_topic_deadline_submission_result_id" {
  description = "Service Bus Topic deadline_submission_result id"
  value       = azurerm_servicebus_topic.deadline_submission_result.id
}

output "service_bus_nsip_project_update_topic_id" {
  description = "ID of the nsip-project-update Service Bus Topic"
  value       = azurerm_servicebus_topic.nsip_project_update.id
}

output "service_bus_listed_building_topic_id" {
  description = "ID of the listed-building Service Bus Topic, expected to eventually move to an ODW service bus topic"
  value       = azurerm_servicebus_topic.listed_building.id
}

output "sql_server_id" {
  description = "The ID of the Back Office SQL server"
  value       = azurerm_mssql_server.back_office.id
}

output "sql_server_password" {
  description = "The SQL server administrator password"
  sensitive   = true
  value       = random_password.back_office_sql_server_password.result
}

output "sql_server_username" {
  description = "The SQL server administrator username"
  sensitive   = true
  value       = local.sql_server_username
}

output "clamav_host" {
  description = "Hostname of the ClamAV Container Group"
  value       = module.app_services.clamav_host
}
