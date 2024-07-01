apps_config = {
  app_service_plan_sku       = "P0v3"
  functions_node_version     = 18
  functions_service_plan_sku = "P0v3"
  node_environment           = "development"
  private_endpoint_enabled   = false

  auth = {
    client_id = "64c20f53-becf-4b7e-ba62-c1dc9b03ccf9" # Appeals Back Office DEV
    group_ids = {
      case_officer = "cc4133e5-2319-4762-8a7b-33413701210a"
      cs_team      = "455cbf03-f92f-4357-8daa-9f513b21fb73"
      inspector    = "0724c372-098d-4eef-acfb-bc85cd483dd1"
      legal        = "369caed5-fe22-445e-8cdc-8b2f6746afc7"
      pads         = "5afda392-73c5-4c18-a76f-7e3b1933813c"
      read_only    = "60acabaa-6ac9-4462-828a-b79adc3d802c"
    }
  }

  integrations = {
    horizon_api_url               = "http://10.0.7.4:8000" # required by config validation, even if mocked
    horizon_mock                  = true
    horizon_web_url               = ""
    service_bus_broadcast_enabled = true
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
    capacity = 0
    family   = "C"
    sku_name = "Basic"
  }
}

alerts_enabled = false

common_config = {
  resource_group_name = "pins-rg-common-dev-ukw-001"
  action_group_names = {
    bo_tech              = "pins-ag-odt-appeals-bo-tech-dev"
    bo_service_manager   = "pins-ag-odt-appeals-bo-service-manager-dev"
    fo_tech              = "pins-ag-odt-appeals-fo-tech-dev"
    fo_service_manager   = "pins-ag-odt-appeals-fo-service-manager-dev"
    data_service_manager = "pins-ag-odt-data-service-manager-dev"
    iap                  = "pins-ag-odt-iap-dev"
    its                  = "pins-ag-odt-its-dev"
    info_sec             = "pins-ag-odt-info-sec-dev"
  }
}

documents_config = {
  account_replication_type = "LRS"
  domain                   = "https://back-office-appeals-docs-dev.planninginspectorate.gov.uk"
}

environment = "dev"

front_office_infra_config = {
  deploy_connections = true
  network = {
    name = "pins-vnet-common-dev-ukw-001"
    rg   = "pins-rg-common-dev-ukw-001"
  }
}

service_bus_config = {
  sku                           = "Standard"
  capacity                      = 0
  public_network_access_enabled = true
}

sql_config = {
  admin = {
    login_username = "pins-odt-sql-dev-appeals-bo"
    object_id      = "1c3b7d11-36c4-41ca-90b5-d15eafbe3b61"
  }
  sku_name    = "Basic"
  max_size_gb = 2
  retention = {
    audit_days             = 7
    short_term_days        = 7
    long_term_weekly       = "P1W"
    long_term_monthly      = "P1M"
    long_term_yearly       = "P1Y"
    long_term_week_of_year = 1
  }
  public_network_access_enabled = true
}

vnet_config = {
  address_space                       = "10.15.0.0/22"
  apps_subnet_address_space           = "10.15.0.0/24"
  main_subnet_address_space           = "10.15.1.0/24"
  secondary_address_space             = "10.15.16.0/22"
  secondary_apps_subnet_address_space = "10.15.16.0/24"
  secondary_subnet_address_space      = "10.15.17.0/24"
}

web_app_domain = "back-office-appeals-dev.planninginspectorate.gov.uk"
