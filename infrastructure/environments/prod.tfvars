apps_config = {
  app_service_plan_sku       = "P1v3"
  functions_node_version     = 20
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
    horizon_timeout               = 5000
    service_bus_broadcast_enabled = true
    enable_test_endpoints         = false
    notify_template_ids = {
      appeal_confirmed_id                                             = "1776217e-b40d-4d78-82d1-8d881dcec897"
      appeal_incomplete_id                                            = "4001ac42-0d2f-4520-b1c0-cae481dd18ba"
      appeal_invalid_id                                               = "fdce6d3b-f712-4d12-94c6-e8a994fdbdaf"
      appeal_start_date_change_appellant_id                           = "76fc3001-5393-48ef-ae1a-377089e6ec5e"
      appeal_start_date_change_lpa_id                                 = "e238c035-e087-4e3e-ba37-a3869478fff1"
      appeal_type_changed_non_has_id                                  = "0792f620-b5ec-44e8-a757-cebf9f564175"
      appeal_valid_start_case_appellant_id                            = "b2e2a6a9-a788-4e6d-ab88-4fdf5f01b8ce"
      appeal_valid_start_case_lpa_id                                  = "6fc2ea73-4c82-42ec-bdab-e6026e1ef4b2"
      appeal_valid_start_case_s78_appellant_id                        = "12d7a181-9e8e-45c2-bb77-8e4e0bfe50a7"
      appeal_valid_start_case_s78_lpa_id                              = "6fc2ea73-4c82-42ec-bdab-e6026e1ef4b2"
      appeal_withdrawn_appellant_id                                   = "e1ec7728-11c0-4032-9c9e-574ea553c15c"
      appeal_withdrawn_lpa_id                                         = "852d47e1-2e0b-48e8-96c0-f5ab5e0721ed"
      decision_is_allowed_split_dismissed_appellant_id                = "3bbe584f-810f-4f1c-9124-8695d5a94b60"
      decision_is_allowed_split_dismissed_lpa_id                      = "7eddc354-a436-4b99-b94c-e10ec8e9b484"
      decision_is_invalid_appellant_id                                = "3de3de2a-f957-4657-9ae6-c54b6bb235f4"
      decision_is_invalid_lpa_id                                      = "8a71a1e7-45f4-4962-a5f2-324e7088f9ad"
      lpaq_complete_id                                                = "e89bf772-8275-4f21-98da-c9a5dd862120"
      lpaq_complete_appellant_id                                      = "9713edc7-1d72-4c27-ba36-7352d177950c"
      lpaq_incomplete_id                                              = "f41e0e94-c410-4f8a-ad5d-3b8a9c169929"
      site_visit_change_accompanied_date_change_appellant_id          = "695939b8-5bd8-4ecc-92ae-167641d5408a"
      site_visit_change_accompanied_date_change_lpa_id                = "9c0fc905-6912-43a1-be4c-cc1f1e0303c2"
      site_visit_change_accompanied_to_access_required_appellant_id   = "24fd5269-db45-4da4-a6d2-47ede5c2e5f6"
      site_visit_change_accompanied_to_access_required_lpa_id         = "6571aec0-ea6b-416a-9365-f9414a931ab9"
      site_visit_change_accompanied_to_unaccompanied_appellant_id     = "25552ae8-a4ea-48e3-bd8b-939cc02b5db0"
      site_visit_change_accompanied_to_unaccompanied_lpa_id           = "6571aec0-ea6b-416a-9365-f9414a931ab9"
      site_visit_change_access_required_date_change_appellant_id      = "fb097cae-f19c-4c75-81e2-c394ec80c31d"
      site_visit_change_access_required_to_accompanied_appellant_id   = "9676a1cd-c54c-434f-aa5d-082c22ee9e78"
      site_visit_change_access_required_to_accompanied_lpa_id         = "47983ef3-f92c-47b8-bb0f-8debd9a19856"
      site_visit_change_access_required_to_unaccompanied_appellant_id = "832ea5b1-4aea-4c07-871b-3153beac13b4"
      site_visit_change_unaccompanied_to_access_required_appellant_id = "24fd5269-db45-4da4-a6d2-47ede5c2e5f6"
      site_visit_change_unaccompanied_to_accompanied_appellant_id     = "0345224c-d26c-4491-b412-7f49c1744e58"
      site_visit_change_unaccompanied_to_accompanied_lpa_id           = "47983ef3-f92c-47b8-bb0f-8debd9a19856"
      site_visit_schedule_access_required_appellant_id                = "7bd42625-5a45-46a4-8419-3271902c8e72"
      site_visit_schedule_accompanied_appellant_id                    = "2b1bc1e3-c9bb-440b-b04b-074757794d32"
      site_visit_schedule_accompanied_lpa_id                          = "47983ef3-f92c-47b8-bb0f-8debd9a19856"
      site_visit_schedule_unaccompanied_appellant_id                  = "3f3714f0-00f0-4fc8-8c49-551e4a844643"
      valid_appellant_case_id                                         = "76688636-beb1-4af5-8310-c99723c2ba41"
      comment_rejected_id                                             = "55b7ade6-1f47-4fa6-abca-0116874e7d14"
      comment_rejected_appellant_id                                   = "03939380-0d9e-46fd-a80e-4390f9e04c78"
      comment_rejected_lpa_id                                         = "d14c65ec-691d-4f5a-9b68-91fe0251b68d"
      comment_rejected_deadline_extended_id                           = "2dcee08f-d382-4b9f-ac45-95979d25cb5c"
      lpa_statement_incomplete_id                                     = "a452a5c5-f5e2-4fce-b3de-09f083a6f53e"
      appellant_final_comments_done_id                                = "26ae9f84-474b-4303-94b9-581af40d2c39"
      lpa_final_comments_done_id                                      = "dde6eea2-2278-474b-b288-3f45d61d6c5d"
      received_statement_and_ip_comments_appellant_id                 = "26ae9f84-474b-4303-94b9-581af40d2c39"
      received_statement_and_ip_comments_lpa_id                       = "dde6eea2-2278-474b-b288-3f45d61d6c5d"
    }
  }

  featureFlags = {
    featureFlagS78Written = false
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

front_door_config = {
  name        = "pins-fd-common-prod"
  rg          = "pins-rg-common-prod"
  ep_name     = "pins-fde-appeals-prod"
  use_tooling = false
}

front_office_infra_config = {
  deploy_connections = true
  network = {
    name = "pins-vnet-common-prod-ukw-001"
    rg   = "pins-rg-common-prod-ukw-001"
  }
}

horizon_infra_config = {
  deploy_connections = true
  subscription_id    = "cbd9712b-34c8-4c94-9633-37ffc0f54f9d"
  network = {
    name = "VNPRD-192.168.0.0-16"
    rg   = "PRDHZN"
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

waf_rate_limits = {
  enabled             = true
  duration_in_minutes = 5
  threshold           = 1500
}
