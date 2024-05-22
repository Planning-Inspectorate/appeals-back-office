# common variables loaded by default
# see https://developer.hashicorp.com/terraform/language/values/variables#variable-definitions-tfvars-files

sb_topic_names = {
  submissions = {
    appellant         = "appeal-fo-appellant-submission"
    lpa_questionnaire = "appeal-fo-lpa-questionnaire-submission"
  }

  events = {
    appeal           = "appeal"
    document         = "appeal-document"
    document_to_move = "appeal-document-to-move"
    event            = "appeal-event"
    listed_building  = "listed-building"
    service_user     = "appeal-service-user"
  }
}

sb_ttl = {
  # default service bus topic TTL
  default = "P3D"
  # default TTL for back office subscriptions
  bo_sub = "P1D"
  # default TTL for internal subscriptions, used for background process such as notify subscribers
  bo_internal = "P1D"
  # default TTL for front office subscriptions
  fo_sub = "P1D"
}

tooling_config = {
  container_registry_name = "pinscrsharedtoolinguks"
  container_registry_rg   = "pins-rg-shared-tooling-uks"
  network_name            = "pins-vnet-shared-tooling-uks"
  network_rg              = "pins-rg-shared-tooling-uks"
  subscription_id         = "edb1ff78-90da-4901-a497-7e79f966f8e2"
}
