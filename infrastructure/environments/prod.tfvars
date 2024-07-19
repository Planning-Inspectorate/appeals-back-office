apps_config = {
  app_service_plan_sku       = "P1v3"
  functions_node_version     = 18
  functions_service_plan_sku = "P1v3"
  node_environment           = "production"
  private_endpoint_enabled   = true

  auth = {
    client_id = "ba49fd0e-11ad-48e2-8bfb-a203defb625f" # Appeals Back Office PROD
    group_ids = {
      case_officer = "5d82e08c-8f05-40ea-a3df-d306f3a2c870"
      cs_team      = "4b64c25d-1946-41c4-b031-45e5d0fa67c9"
      inspector    = "c921094a-318f-4996-be5e-9bd2ef9b7bdf"
      legal        = "adad581e-e76e-4cbb-8251-bdd136f4fa2c"
      pads         = "2d9e47f0-c803-423d-95d6-d1df72d6b7d8"
      read_only    = "5e0082df-ab71-4e10-91ca-36e3ed587a29"
    }
  }

  integrations = {
    horizon_api_url               = "http://10.224.161.68:8000"
    horizon_mock                  = false
    horizon_web_url               = "https://horizonweb.planninginspectorate.gov.uk/otcs/llisapi.dll?func=ll&objId="
    horizon_timeout               = 500
    service_bus_broadcast_enabled = false
    notify_template_ids = {
      appeal_confirmed_id                                             = "783f94cc-1d6d-4153-8ad7-9070e449a57c"
      appeal_incomplete_id                                            = "f9cbd646-be00-45e2-96fc-f47e585e5b5e"
      appeal_invalid_id                                               = "59c8337a-e854-4fc4-8c83-aa958b91bd99"
      appeal_start_date_change_appellant_id                           = "8e650ba9-ffb9-4fa8-bfb7-96c9bdebd8ec"
      appeal_start_date_change_lpa_id                                 = "8ccb2010-c1b6-4345-bde3-cc17f9d786ce"
      appeal_type_changed_non_has_id                                  = "32201ca6-1fcc-4be0-b067-427c57327be9"
      appeal_valid_start_case_appellant_id                            = "1e5169b5-88b4-4d86-bbe5-77cc464ffc04"
      appeal_valid_start_case_lpa_id                                  = "c4701212-4b6a-4b55-801a-c86c7dbea54b"
      appeal_withdrawn_id                                             = "5f58736a-bd1b-4215-a288-0d5f25ceab43"
      decision_is_allowed_split_dismissed_appellant_id                = "4accd6da-798f-4d68-9367-6058194bc511"
      decision_is_allowed_split_dismissed_lpa_id                      = "09dbb936-bc1a-400b-a2f8-711078921bf5"
      decision_is_invalid_appellant_id                                = "bd117483-e7fe-4655-8f57-cf597ad57710"
      decision_is_invalid_lpa_id                                      = "a0cb542f-24d3-4b22-826b-1e012892f922"
      lpaq_complete_id                                                = "c571ee53-69c8-400e-a4c0-44ded262a081"
      lpaq_incomplete_id                                              = "4701bc3c-2f24-4ed8-8841-14d93c3b9964"
      site_visit_change_accompanied_date_change_appellant_id          = "3bd2cd75-bf1e-4256-8a4c-5c5739bc0ecc"
      site_visit_change_accompanied_date_change_lpa_id                = "5d23f669-a1d2-4232-9171-10f956dfb400"
      site_visit_change_accompanied_to_access_required_appellant_id   = "f9bd99e7-f3f1-4836-a2dc-018dfdece854"
      site_visit_change_accompanied_to_access_required_lpa_id         = "15acdaee-ca9d-4001-bb93-9f50ab29226d"
      site_visit_change_accompanied_to_unaccompanied_appellant_id     = "5056b6fe-095f-45ad-abb5-0a582ef274c3"
      site_visit_change_accompanied_to_unaccompanied_lpa_id           = "15acdaee-ca9d-4001-bb93-9f50ab29226d"
      site_visit_change_access_required_date_change_appellant_id      = "1b963d2c-ae50-45c4-abbb-149481c69074"
      site_visit_change_access_required_to_accompanied_appellant_id   = "0b7d9246-99b8-43d7-8205-02a3c9762691"
      site_visit_change_access_required_to_accompanied_lpa_id         = "03a6616e-3e0c-4f28-acd5-f4e873847457"
      site_visit_change_access_required_to_unaccompanied_appellant_id = "a4964a74-af84-45c2-a61b-162a92f94087"
      site_visit_change_unaccompanied_to_access_required_appellant_id = "f9bd99e7-f3f1-4836-a2dc-018dfdece854"
      site_visit_change_unaccompanied_to_accompanied_appellant_id     = "771691cb-81cc-444a-8db0-dbbd4f66b61f"
      site_visit_change_unaccompanied_to_accompanied_lpa_id           = "03a6616e-3e0c-4f28-acd5-f4e873847457"
      site_visit_schedule_access_required_appellant_id                = "44ff947d-f93d-4333-9366-97ab7a5aa722"
      site_visit_schedule_accompanied_appellant_id                    = "4002346f-fd65-42fe-b663-36600b85080c"
      site_visit_schedule_accompanied_lpa_id                          = "03a6616e-3e0c-4f28-acd5-f4e873847457"
      site_visit_schedule_unaccompanied_appellant_id                  = "a33bb800-56d9-46a4-ba64-35d9d0263666"
      valid_appellant_case_id                                         = "3b4b74b4-b604-411b-9c98-5be2c6f3bdfd"
    }
  }

  logging = {
    level_file   = "silent"
    level_stdout = "info"
  }

  redis = {
    capacity = 1
    family   = "C"
    sku_name = "Standard"
  }
}

common_config = {
  resource_group_name = "pins-rg-common-prod-ukw-001"
  action_group_names = {
    bo_tech              = "pins-ag-odt-appeals-bo-tech-prod"
    bo_service_manager   = "pins-ag-odt-appeals-bo-service-manager-prod"
    fo_tech              = "pins-ag-odt-appeals-fo-tech-prod"
    fo_service_manager   = "pins-ag-odt-appeals-fo-service-manager-prod"
    data_service_manager = "pins-ag-odt-data-service-manager-prod"
    iap                  = "pins-ag-odt-iap-prod"
    its                  = "pins-ag-odt-its-prod"
    info_sec             = "pins-ag-odt-info-sec-prod"
  }
}

documents_config = {
  account_replication_type = "GZRS"
  domain                   = "https://appeal-documents.planninginspectorate.gov.uk"
}

environment = "prod"

front_office_infra_config = {
  deploy_connections = true
  network = {
    name = "pins-vnet-common-prod-ukw-001"
    rg   = "pins-rg-common-prod-ukw-001"
  }
}

service_bus_config = {
  sku                           = "Premium"
  capacity                      = 1
  public_network_access_enabled = false
}

sql_config = {
  admin = {
    login_username = "pins-odt-sql-prod-appeals-bo"
    object_id      = "0fff01c6-b8bc-4b32-8f2d-1a1d122b7189"
  }
  sku_name    = "S0"
  max_size_gb = 250
  retention = {
    audit_days             = 120
    short_term_days        = 30
    long_term_weekly       = "P1W"
    long_term_monthly      = "P1M"
    long_term_yearly       = "P1Y"
    long_term_week_of_year = 1
  }
  public_network_access_enabled = false
}

vnet_config = {
  address_space                       = "10.15.12.0/22"
  apps_subnet_address_space           = "10.15.12.0/24"
  main_subnet_address_space           = "10.15.13.0/24"
  secondary_address_space             = "10.15.28.0/22"
  secondary_apps_subnet_address_space = "10.15.28.0/24"
  secondary_subnet_address_space      = "10.15.29.0/24"
}

web_app_domain = "back-office-appeals.planninginspectorate.gov.uk"
