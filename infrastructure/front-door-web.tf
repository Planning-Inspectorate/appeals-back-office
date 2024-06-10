resource "azurerm_cdn_frontdoor_profile" "web" {
  name                = "${local.org}-fd-${local.service_name}-web-${var.environment}"
  resource_group_name = azurerm_resource_group.primary.name
  sku_name            = "Premium_AzureFrontDoor"

  tags = local.tags
}

resource "azurerm_cdn_frontdoor_endpoint" "web" {
  name                     = "${local.org}-fd-${local.service_name}-web-${var.environment}"
  cdn_frontdoor_profile_id = azurerm_cdn_frontdoor_profile.web.id

  tags = local.tags
}

resource "azurerm_cdn_frontdoor_origin_group" "web" {
  name                     = "${local.org}-fd-${local.service_name}-web-${var.environment}"
  cdn_frontdoor_profile_id = azurerm_cdn_frontdoor_profile.web.id
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

resource "azurerm_cdn_frontdoor_origin" "web" {
  name                          = "${local.org}-fd-${local.service_name}-web-${var.environment}"
  cdn_frontdoor_origin_group_id = azurerm_cdn_frontdoor_origin_group.web.id
  enabled                       = true

  certificate_name_check_enabled = true

  host_name          = module.app_web.default_site_hostname
  origin_host_header = module.app_web.default_site_hostname
  http_port          = 80
  https_port         = 443
  priority           = 1
  weight             = 1000
}

resource "azurerm_cdn_frontdoor_custom_domain" "web" {
  name                     = "${local.org}-fd-${local.service_name}-web-${var.environment}"
  cdn_frontdoor_profile_id = azurerm_cdn_frontdoor_profile.web.id
  host_name                = var.web_app_domain

  tls {
    certificate_type    = "ManagedCertificate"
    minimum_tls_version = "TLS12"
  }
}

resource "azurerm_cdn_frontdoor_route" "web" {
  name                          = "${local.org}-fd-${local.service_name}-web-${var.environment}"
  cdn_frontdoor_endpoint_id     = azurerm_cdn_frontdoor_endpoint.web.id
  cdn_frontdoor_origin_group_id = azurerm_cdn_frontdoor_origin_group.web.id
  cdn_frontdoor_origin_ids      = [azurerm_cdn_frontdoor_origin.web.id]

  forwarding_protocol    = "MatchRequest"
  https_redirect_enabled = true
  patterns_to_match      = ["/*"]
  supported_protocols    = ["Http", "Https"]


  cdn_frontdoor_custom_domain_ids = [azurerm_cdn_frontdoor_custom_domain.web.id]
  link_to_default_domain          = false
}

resource "azurerm_cdn_frontdoor_custom_domain_association" "web" {
  cdn_frontdoor_custom_domain_id = azurerm_cdn_frontdoor_custom_domain.web.id
  cdn_frontdoor_route_ids        = [azurerm_cdn_frontdoor_route.web.id]
}

# WAF policy
resource "azurerm_cdn_frontdoor_firewall_policy" "web" {
  name                              = replace("${local.org}-waf-${local.service_name}-web-${var.environment}", "-", "")
  resource_group_name               = azurerm_resource_group.primary.name
  sku_name                          = "Premium_AzureFrontDoor"
  enabled                           = true
  mode                              = "Prevention"
  custom_block_response_status_code = 403

  tags = local.tags

  custom_rule {
    name                           = "RateLimitHttpRequest"
    enabled                        = true
    priority                       = 100
    rate_limit_duration_in_minutes = 1
    rate_limit_threshold           = 300
    type                           = "RateLimitRule"
    action                         = "Block"

    match_condition {
      match_variable = "RequestMethod"
      operator       = "Equal"
      match_values = [
        "GET",
        "POST",
        "PUT",
        "DELETE",
        "COPY",
        "MOVE",
        "HEAD",
        "OPTIONS"
      ]
    }
  }

  managed_rule {
    type    = "Microsoft_DefaultRuleSet"
    version = "2.1"
    action  = "Log"
  }
}

resource "azurerm_cdn_frontdoor_security_policy" "web" {
  name                     = replace("${local.org}-sec-${local.service_name}-web-${var.environment}", "-", "")
  cdn_frontdoor_profile_id = azurerm_cdn_frontdoor_profile.web.id

  security_policies {
    firewall {
      cdn_frontdoor_firewall_policy_id = azurerm_cdn_frontdoor_firewall_policy.web.id

      association {
        domain {
          cdn_frontdoor_domain_id = azurerm_cdn_frontdoor_custom_domain.web.id
        }
        patterns_to_match = ["/*"]
      }
    }
  }
}

# moinitoring
resource "azurerm_monitor_diagnostic_setting" "web_front_door" {
  name                       = "${local.org}-fd-mds-${local.service_name}-web-${var.environment}"
  target_resource_id         = azurerm_cdn_frontdoor_profile.web.id
  log_analytics_workspace_id = azurerm_log_analytics_workspace.main.id

  enabled_log {
    category = "FrontdoorWebApplicationFirewallLog"
  }

  metric {
    category = "AllMetrics"
  }

  lifecycle {
    ignore_changes = [
      enabled_log,
      metric
    ]
  }
}
