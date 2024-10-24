resource "azurerm_cdn_frontdoor_profile" "docs" {
  name                = "${local.org}-fd-${local.service_name}-docs-${var.environment}"
  resource_group_name = azurerm_resource_group.primary.name
  sku_name            = "Standard_AzureFrontDoor"

  tags = local.tags
}

resource "azurerm_cdn_frontdoor_endpoint" "docs" {
  name                     = "${local.org}-fd-${local.service_name}-docs-${var.environment}"
  cdn_frontdoor_profile_id = azurerm_cdn_frontdoor_profile.docs.id

  tags = local.tags
}

resource "azurerm_cdn_frontdoor_origin_group" "docs" {
  name                     = "${local.org}-fd-${local.service_name}-docs-${var.environment}"
  cdn_frontdoor_profile_id = azurerm_cdn_frontdoor_profile.docs.id
  session_affinity_enabled = true

  health_probe {
    interval_in_seconds = 240
    path                = "/"
    protocol            = "Https"
    request_type        = "HEAD"
  }

  load_balancing {
    additional_latency_in_milliseconds = 0
    sample_size                        = 16
    successful_samples_required        = 3
  }
}

resource "azurerm_cdn_frontdoor_origin" "docs" {
  name                          = "${local.org}-fd-${local.service_name}-docs-${var.environment}"
  cdn_frontdoor_origin_group_id = azurerm_cdn_frontdoor_origin_group.docs.id
  enabled                       = true

  certificate_name_check_enabled = true

  host_name          = local.documents.blob_endpont
  origin_host_header = local.documents.blob_endpont
  http_port          = 80
  https_port         = 443
  priority           = 1
  weight             = 1000
}

resource "azurerm_cdn_frontdoor_custom_domain" "docs" {
  name                     = "${local.org}-fd-${local.service_name}-docs-${var.environment}"
  cdn_frontdoor_profile_id = azurerm_cdn_frontdoor_profile.docs.id
  host_name                = local.documents.domain

  tls {
    certificate_type    = "ManagedCertificate"
    minimum_tls_version = "TLS12"
  }
}

resource "azurerm_cdn_frontdoor_route" "docs" {
  name                          = "${local.org}-fd-${local.service_name}-docs-${var.environment}"
  cdn_frontdoor_endpoint_id     = azurerm_cdn_frontdoor_endpoint.docs.id
  cdn_frontdoor_origin_group_id = azurerm_cdn_frontdoor_origin_group.docs.id
  cdn_frontdoor_origin_ids      = [azurerm_cdn_frontdoor_origin.docs.id]

  forwarding_protocol    = "MatchRequest"
  https_redirect_enabled = true
  patterns_to_match      = ["/*"]
  supported_protocols    = ["Http", "Https"]


  cdn_frontdoor_custom_domain_ids = [azurerm_cdn_frontdoor_custom_domain.docs.id]
  link_to_default_domain          = false
}

resource "azurerm_cdn_frontdoor_custom_domain_association" "docs" {
  cdn_frontdoor_custom_domain_id = azurerm_cdn_frontdoor_custom_domain.docs.id
  cdn_frontdoor_route_ids        = [azurerm_cdn_frontdoor_route.docs.id]
}
