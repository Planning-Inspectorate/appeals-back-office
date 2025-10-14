{% if has_ip_comments -%}
   We've received comments from interested parties.
{% else -%}
   We did not receive any comments from interested parties.
{% endif -%}

{% if has_ip_comments -%}
You can [view this information in the appeals service]({{front_office_url}}/manage-appeals/{{appeal_reference_number}}).
{% endif -%}

{% include 'parts/appeal-details.md' %}

{% if what_happens_next -%}
# What happens next

{{what_happens_next}}

{% endif -%}

The Planning Inspectorate
{{team_email_address}}
