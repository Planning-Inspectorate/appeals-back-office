
{% include 'parts/statements-received-content.md' %}

{% if anyOtherSubmitted -%}
You can [view this information in the appeals service]({{front_office_url}}/rule-6/{{appeal_reference_number}}).
{% endif -%}

{% include 'parts/appeal-details.md' %}

{% if what_happens_next -%}
# What happens next

{{what_happens_next}}

{% endif -%}

The Planning Inspectorate
{{team_email_address}}
