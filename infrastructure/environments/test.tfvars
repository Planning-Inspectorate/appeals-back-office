apps_config = {
  app_service_plan_sku       = "P1v3"
  functions_node_version     = 20
  functions_service_plan_sku = "P1v3"
  node_environment           = "production"
  private_endpoint_enabled   = true

  auth = {
    client_id = "591f9564-095c-459a-b090-ce0f0a16ee09" # Appeals Back Office TEST
    group_ids = {
      case_officer = "e30a4389-029b-4de8-a94b-c492a3a0854a"
      cs_team      = "812fec35-4f1e-4a7c-bb1a-49d1a9fea519"
      inspector    = "3cf2c6ae-cd39-4027-accd-3c906b5462d4"
      legal        = "5ab0da43-964d-4897-ae44-880fe7990225"
      pads         = "2a609915-8dcf-4e83-8533-db0256d31646"
      read_only    = "0c67d3af-5e56-4f64-98b2-7f55a133b6ea"
    }
  }

  integrations = {
    horizon_api_url               = "http://10.0.7.4:8000"
    horizon_mock                  = false
    horizon_web_url               = "https://horizontest.planninginspectorate.gov.uk/otcs/llisapi.dll?func=ll&objId="
    horizon_timeout               = 5000
    service_bus_broadcast_enabled = true
    enableTestEndpoints           = true
    notify_template_ids = {
      appeal_confirmed_id                                             = "783f94cc-1d6d-4153-8ad7-9070e449a57c"
      appeal_incomplete_id                                            = "f9cbd646-be00-45e2-96fc-f47e585e5b5e"
      appeal_invalid_id                                               = "59c8337a-e854-4fc4-8c83-aa958b91bd99"
      appeal_start_date_change_appellant_id                           = "8e650ba9-ffb9-4fa8-bfb7-96c9bdebd8ec"
      appeal_start_date_change_lpa_id                                 = "8ccb2010-c1b6-4345-bde3-cc17f9d786ce"
      appeal_type_changed_non_has_id                                  = "32201ca6-1fcc-4be0-b067-427c57327be9"
      appeal_valid_start_case_appellant_id                            = "1e5169b5-88b4-4d86-bbe5-77cc464ffc04"
      appeal_valid_start_case_lpa_id                                  = "c4701212-4b6a-4b55-801a-c86c7dbea54b"
      appeal_valid_start_case_s78_appellant_id                        = "37367d1d-5254-4caf-a7b2-e1b4335e3f04"
      appeal_valid_start_case_s78_lpa_id                              = "c4701212-4b6a-4b55-801a-c86c7dbea54b"
      appeal_withdrawn_appellant_id                                   = "5f58736a-bd1b-4215-a288-0d5f25ceab43"
      appeal_withdrawn_lpa_id                                         = "6eb8dc75-e141-4e06-a8ee-241e7f7c448c"
      decision_is_allowed_split_dismissed_appellant_id                = "4accd6da-798f-4d68-9367-6058194bc511"
      decision_is_allowed_split_dismissed_lpa_id                      = "09dbb936-bc1a-400b-a2f8-711078921bf5"
      decision_is_invalid_appellant_id                                = "bd117483-e7fe-4655-8f57-cf597ad57710"
      decision_is_invalid_lpa_id                                      = "a0cb542f-24d3-4b22-826b-1e012892f922"
      lpaq_complete_id                                                = "c571ee53-69c8-400e-a4c0-44ded262a081"
      lpaq_complete_appellant_id                                      = "13f29a07-019c-4237-b483-d930f8393aa1"
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
      comment_rejected_id                                             = "13924f23-8b50-4e2e-86f2-70b92360889b"
      comment_rejected_appellant_id                                   = "3165d99e-f628-4623-95e4-acdebf6d700c"
      comment_rejected_lpa_id                                         = "ebb2d0e0-2146-43a5-a6f5-d45e9ee0ca3f"
      comment_rejected_deadline_extended_id                           = "ccffeb37-c7e0-4c38-888c-6cf2755f6703"
      lpa_statement_incomplete_id                                     = "471cfa29-ecd4-485a-8ead-dbc73285637a"
      appellant_final_comments_done_id                                = "c368f84b-01ad-4a78-9823-27ba4ce74351"
      lpa_final_comments_done_id                                      = "be3c6c21-f429-4ab3-87f9-d5e280650543"
      received_statement_and_ip_comments_appellant_id                 = "c368f84b-01ad-4a78-9823-27ba4ce74351"
      received_statement_and_ip_comments_lpa_id                       = "be3c6c21-f429-4ab3-87f9-d5e280650543"
    }
  }

  featureFlags = {
    featureFlagS78Written = true
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

common_config = {
  resource_group_name = "pins-rg-common-test-ukw-001"
  action_group_names = {
    bo_tech              = "pins-ag-odt-appeals-bo-tech-test"
    bo_service_manager   = "pins-ag-odt-appeals-bo-service-manager-test"
    fo_tech              = "pins-ag-odt-appeals-fo-tech-test"
    fo_service_manager   = "pins-ag-odt-appeals-fo-service-manager-test"
    data_service_manager = "pins-ag-odt-data-service-manager-test"
    iap                  = "pins-ag-odt-iap-test"
    its                  = "pins-ag-odt-its-test"
    info_sec             = "pins-ag-odt-info-sec-test"
  }
}

documents_config = {
  account_replication_type = "LRS"
  domain                   = "https://back-office-appeals-docs-test.planninginspectorate.gov.uk"
}

environment = "test"

front_door_config = {
  name        = "pins-fd-common-tooling"
  rg          = "pins-rg-common-tooling"
  ep_name     = "pins-fde-appeals"
  use_tooling = true
}

front_office_infra_config = {
  deploy_connections = true
  network = {
    name = "pins-vnet-common-test-ukw-001"
    rg   = "pins-rg-common-test-ukw-001"
  }
}

horizon_infra_config = {
  deploy_connections = true
  subscription_id    = "cbd9712b-34c8-4c94-9633-37ffc0f54f9d"
  network = {
    name = "VNPRE-10.0.0.0-16"
    rg   = "PREHZN"
  }
}

service_bus_config = {
  sku                           = "Premium"
  capacity                      = 1
  public_network_access_enabled = false
}

sql_config = {
  admin = {
    login_username = "pins-odt-sql-test-appeals-bo"
    object_id      = "1819fc4a-bd5e-4e01-a727-16d865fb3f82"
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
  public_network_access_enabled = true
}

vnet_config = {
  address_space                       = "10.15.4.0/22"
  apps_subnet_address_space           = "10.15.4.0/24"
  main_subnet_address_space           = "10.15.5.0/24"
  secondary_address_space             = "10.15.20.0/22"
  secondary_apps_subnet_address_space = "10.15.20.0/24"
  secondary_subnet_address_space      = "10.15.21.0/24"
}

web_app_domain = "back-office-appeals-test.planninginspectorate.gov.uk"

waf_rate_limits = {
  enabled             = true
  duration_in_minutes = 5
  threshold           = 1500
}
