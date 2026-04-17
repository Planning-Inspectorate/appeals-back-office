{% if not has_lpa_statement and not has_ip_comments -%}
   We did not receive a statement or any comments from interested parties.
{% elif has_lpa_statement and has_ip_comments -%}
   We have received the local planning authority's statement and any comments from interested parties.
{% elif has_lpa_statement -%}
   We have received the local planning authority's statement. We did not receive any comments from interested parties. 
{% elif has_ip_comments -%}
   We have received comments from interested parties. We did not receive a statement from the local planning authority.
{% endif -%}

{% if has_lpa_statement or has_ip_comments -%}
   You can [view this information in the appeals service]({{front_office_url}}/appeals/{{appeal_reference_number}}).
{% endif -%}

{% include 'parts/appeal-details.md' %}

# What happens next

{% if has_lpa_statement or has_ip_comments -%}
   You need to [submit your final comments]({{front_office_url}}/appeals/{{appeal_reference_number}}) by {{final_comments_due_date}}.
{% endif -%}

{% if not has_lpa_statement and not has_ip_comments -%}
   The inspector will visit the site and we will contact you when we have made the decision.
{% endif %}
Planning Inspectorate
{{team_email_address}}
