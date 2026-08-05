{% if has_lpa_statement and has_ip_comments -%}
   We have received the local planning authority's questionnaire, all statements and comments from interested parties.
{% elif has_lpa_statement -%}
   We have received a statement from the local planning authority.
{% elif has_ip_comments -%}
   We have received comments from interested parties.
{% endif -%}

{% if has_lpa_statement or has_ip_comments -%}
You can [view this information in the appeals service]({{front_office_url}}/appeals/{{appeal_reference_number}}).
{% endif -%}

{% if not has_lpa_statement -%}
   The local planning authority did not submit a statement.
{% endif -%}
{% if not has_ip_comments -%}
   We did not receive any comments from interested parties.
{% endif -%}

{% include 'parts/appeal-details.md' %}

# What happens next

{% if hearing_date -%}
   Your hearing is on {{hearing_date}}.
{% endif -%}

We will contact you if we need any more information.

Planning Inspectorate
{{team_email_address}}
