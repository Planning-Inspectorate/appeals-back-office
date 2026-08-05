{% if has_lpa_statement and has_ip_comments -%}
   We have received:
   - all statements
   - comments from interested parties
{% elif has_ip_comments -%}
   We've received comments from interested parties.
{% else -%}
   We did not receive any comments from interested parties.
{% endif -%}

{% if has_ip_comments -%}
You can [view this information in the appeals service]({{front_office_url}}/manage-appeals/{{appeal_reference_number}}).
{% endif -%}

{% include 'parts/appeal-details.md' %}

# What happens next

{% if hearing_date -%}
   The hearing is on {{hearing_date}}.
{% else -%}
   We will contact you when the hearing has been set up.
{% endif %}
Planning Inspectorate
{{team_email_address}}
