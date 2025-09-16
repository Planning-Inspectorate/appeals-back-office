

{% if has_statement and has_ip_comments -%}
   We have received the local planning authority's questionnaire, all statements and comments from interested parties.
{% elif has_statement -%}
   We have received a statement from the local planning authority.
{% elif has_ip_comments -%}
   We have received comments from interested parties.
{% endif -%}

{% if has_statement or has_ip_comments -%}
You can [view this information in the appeals service]({{front_office_url}}/appeals/{{appeal_reference_number}}).
{% endif -%}

{% if not has_statement -%}
   The local planning authority did not submit a statement.
{% endif -%}
{% if not has_ip_comments -%}
   We did not receive any comments from interested parties.
{% endif -%}

{% include 'parts/appeal-details.md' %}

{% if what_happens_next -%}
# What happens next

{{what_happens_next}}

{% endif -%}

The Planning Inspectorate
caseofficers@planninginspectorate.gov.uk
