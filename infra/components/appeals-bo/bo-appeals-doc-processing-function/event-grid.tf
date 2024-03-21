resource "azurerm_eventgrid_event_subscription" "malware_scanning_bo_subscription" {
  name  = "malware-scanning-bo-subscription"
  scope = var.malware_scanning_topic_id

  azure_function_endpoint {
    function_id                       = "${module.bo_appeals_doc_processing_function.app_id}/functions/malware-detection"
    max_events_per_batch              = 1
    preferred_batch_size_in_kilobytes = 64
  }
}
