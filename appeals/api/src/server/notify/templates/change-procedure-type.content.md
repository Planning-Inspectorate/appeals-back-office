{{change_message}}

{% include 'parts/appeal-details.md' %}

# What happens next

{% if appeal_procedure == 'written' -%}
{% if lpa_statement_exists and is_lpa -%}
You need to [submit a new statement]({{front_office_url}}/manage-appeals/{{appeal_reference_number}}).

{% endif -%}

We will send you another email when:
• you can [submit your final comments]({{front_office_url}}/manage-appeals/{{appeal_reference_number}})
• we set up the site visit

{% endif -%}

The Planning Inspectorate
{{team_email_address}}
