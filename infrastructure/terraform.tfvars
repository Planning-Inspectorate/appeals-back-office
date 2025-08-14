# common variables loaded by default
# see https://developer.hashicorp.com/terraform/language/values/variables#variable-definitions-tfvars-files

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

beta_feedback_url = "https://forms.office.com/Pages/ResponsePage.aspx?id=mN94WIhvq0iTIpmM5VcIjYt1ax_BPvtOqhVjfvzyJN5UQzNVQjdaV0U0TDdTOE1LNktBT0w5NEQ1Vy4u"
