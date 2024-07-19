apps_config = {
  app_service_plan_sku       = "P1v3"
  functions_node_version     = 18
  functions_service_plan_sku = "P1v3"
  node_environment           = "production"
  private_endpoint_enabled   = true

  auth = {
    client_id = "68721db0-46ce-4ac5-b404-a4eebdb5c8e1" # Appeals Back Office Training
    group_ids = {
      case_officer = "48a7eb59-34ee-4da8-84fc-3b27f473b4f9"
      cs_team      = "863ffff7-b3c2-4c83-b82b-c2443cac96ae"
      inspector    = "e7a0bcbc-aa39-496f-8b73-aa91e7577285"
      legal        = "b7b4aff7-df95-42cc-840e-b3a3a59f4d0d"
      pads         = "d8504f10-b4b8-4959-9165-686bf9501168"
      read_only    = "6d323e05-322e-44d3-9f26-0c427b047ccb"
    }
  }

  integrations = {
    horizon_api_url               = "http://10.0.7.4:8000"
    horizon_mock                  = false
    horizon_web_url               = "https://horizontest.planninginspectorate.gov.uk/otcs/llisapi.dll?func=ll&objId="
    horizon_timeout               = 500
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
    capacity = 1
    family   = "C"
    sku_name = "Standard"
  }
}

common_config = {
  resource_group_name = "pins-rg-common-training-ukw-001"
  action_group_names = {
    bo_tech              = "pins-ag-odt-appeals-bo-tech-training"
    bo_service_manager   = "pins-ag-odt-appeals-bo-service-manager-training"
    fo_tech              = "pins-ag-odt-appeals-fo-tech-training"
    fo_service_manager   = "pins-ag-odt-appeals-fo-service-manager-training"
    data_service_manager = "pins-ag-odt-data-service-manager-training"
    iap                  = "pins-ag-odt-iap-training"
    its                  = "pins-ag-odt-its-training"
    info_sec             = "pins-ag-odt-info-sec-training"
  }
}

documents_config = {
  account_replication_type = "LRS"
  domain                   = "https://back-office-appeals-docs-training.planninginspectorate.gov.uk"
}

environment = "training"

front_office_infra_config = {
  deploy_connections = true
  network = {
    name = "pins-vnet-common-training-ukw-001"
    rg   = "pins-rg-common-training-ukw-001"
  }
}

service_bus_config = {
  sku                           = "Premium"
  capacity                      = 1
  public_network_access_enabled = false
}

sql_config = {
  admin = {
    login_username = "pins-odt-sql-training-appeals-bo"
    object_id      = "9302da00-8d11-47fb-8894-76fdb47642d9"
  }
  sku_name    = "S0"
  max_size_gb = 250
  retention = {
    audit_days             = 30
    short_term_days        = 7
    long_term_weekly       = "P1W"
    long_term_monthly      = "P1M"
    long_term_yearly       = "P1Y"
    long_term_week_of_year = 1
  }
  public_network_access_enabled = false
}

vnet_config = {
  address_space                       = "10.15.8.0/22"
  apps_subnet_address_space           = "10.15.8.0/24"
  main_subnet_address_space           = "10.15.9.0/24"
  secondary_address_space             = "10.15.24.0/22"
  secondary_apps_subnet_address_space = "10.15.24.0/24"
  secondary_subnet_address_space      = "10.15.25.0/24"
}

web_app_domain = "back-office-appeals-training.planninginspectorate.gov.uk"
