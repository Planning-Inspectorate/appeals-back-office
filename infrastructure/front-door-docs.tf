<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======
=======
>>>>>>> cba86a98c (test(tooling): Adding FrontDoor tooling)
# resource "azurerm_cdn_frontdoor_profile" "docs" {
#   name                = "${local.org}-fd-${local.service_name}-docs-${var.environment}"
#   resource_group_name = azurerm_resource_group.primary.name
#   sku_name            = "Standard_AzureFrontDoor"

#   tags = local.tags
# }

# resource "azurerm_cdn_frontdoor_endpoint" "docs" {
#   name                     = "${local.org}-fd-${local.service_name}-docs-${var.environment}"
#   cdn_frontdoor_profile_id = azurerm_cdn_frontdoor_profile.docs.id

#   tags = local.tags
# }

>>>>>>> c2ef09409 (test(tooling): Adding FrontDoor tooling)
=======
>>>>>>> 25b7dff3a (test(tooling): modifying provider)
resource "azurerm_cdn_frontdoor_origin_group" "docs" {
  name                     = "${local.org}-fd-${local.service_name}-docs-${var.environment}"
  cdn_frontdoor_profile_id = data.azurerm_cdn_frontdoor_profile.web.id
  session_affinity_enabled = true
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
  provider                 = azurerm.front_door
=======
  provider                 = azurerm.tooling
>>>>>>> c2ef09409 (test(tooling): Adding FrontDoor tooling)
=======
  provider                 = azurerm.tooling
>>>>>>> cba86a98c (test(tooling): Adding FrontDoor tooling)
=======
  provider                 = azurerm.front_door
>>>>>>> 25b7dff3a (test(tooling): modifying provider)

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
  name                           = "${local.org}-fd-${local.service_name}-docs-${var.environment}"
  cdn_frontdoor_origin_group_id  = azurerm_cdn_frontdoor_origin_group.docs.id
  enabled                        = true
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
  provider                       = azurerm.front_door
=======
  provider                       = azurerm.tooling
>>>>>>> c2ef09409 (test(tooling): Adding FrontDoor tooling)
=======
  provider                       = azurerm.tooling
>>>>>>> cba86a98c (test(tooling): Adding FrontDoor tooling)
=======
  provider                       = azurerm.front_door
>>>>>>> 25b7dff3a (test(tooling): modifying provider)
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
  cdn_frontdoor_profile_id = data.azurerm_cdn_frontdoor_profile.web.id
  host_name                = local.documents.domain
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
  provider                 = azurerm.front_door
=======
  provider                 = azurerm.tooling
>>>>>>> c2ef09409 (test(tooling): Adding FrontDoor tooling)
=======
  provider                 = azurerm.tooling
>>>>>>> cba86a98c (test(tooling): Adding FrontDoor tooling)
=======
  provider                 = azurerm.front_door
>>>>>>> 25b7dff3a (test(tooling): modifying provider)

  tls {
    certificate_type    = "ManagedCertificate"
    minimum_tls_version = "TLS12"
  }
}

resource "azurerm_cdn_frontdoor_route" "docs" {
  name                          = "${local.org}-fd-${local.service_name}-docs-${var.environment}"
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
  cdn_frontdoor_endpoint_id     = data.azurerm_cdn_frontdoor_endpoint.shared.id
  cdn_frontdoor_origin_group_id = azurerm_cdn_frontdoor_origin_group.docs.id
  cdn_frontdoor_origin_ids      = [azurerm_cdn_frontdoor_origin.docs.id]
  provider                      = azurerm.front_door
=======
  cdn_frontdoor_endpoint_id     = data.azurerm_cdn_frontdoor_endpoint.web.id
  cdn_frontdoor_origin_group_id = azurerm_cdn_frontdoor_origin_group.docs.id
  cdn_frontdoor_origin_ids      = [azurerm_cdn_frontdoor_origin.docs.id]
  provider                      = azurerm.tooling
>>>>>>> c2ef09409 (test(tooling): Adding FrontDoor tooling)
=======
  cdn_frontdoor_endpoint_id     = data.azurerm_cdn_frontdoor_endpoint.web.id
  cdn_frontdoor_origin_group_id = azurerm_cdn_frontdoor_origin_group.docs.id
  cdn_frontdoor_origin_ids      = [azurerm_cdn_frontdoor_origin.docs.id]
  provider                      = azurerm.tooling
>>>>>>> cba86a98c (test(tooling): Adding FrontDoor tooling)
=======
  cdn_frontdoor_endpoint_id     = data.azurerm_cdn_frontdoor_endpoint.shared.id
  cdn_frontdoor_origin_group_id = azurerm_cdn_frontdoor_origin_group.docs.id
  cdn_frontdoor_origin_ids      = [azurerm_cdn_frontdoor_origin.docs.id]
  provider                      = azurerm.front_door
>>>>>>> 25b7dff3a (test(tooling): modifying provider)

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
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
  provider                       = azurerm.front_door
=======
  provider                       = azurerm.tooling
>>>>>>> c2ef09409 (test(tooling): Adding FrontDoor tooling)
=======
  provider                       = azurerm.tooling
>>>>>>> cba86a98c (test(tooling): Adding FrontDoor tooling)
=======
  provider                       = azurerm.front_door
>>>>>>> 25b7dff3a (test(tooling): modifying provider)
}
