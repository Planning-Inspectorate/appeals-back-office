We have received your appeal and we need more information.

# Appeal details

^Appeal reference number: {{appeal_reference_number}}
Address: {{site_address}}
Enforcement notice reference: {{enforcement_reference}}

# Missing information

{% if missing_documents.length -%}
## Missing documents

{% if missing_documents.length > 1 -%}
{%- for missing_document in missing_documents -%}
- {{ missing_document }}
{% endfor %}
{%- else -%}
{{ missing_documents[0] }}
{% endif %}
{% endif -%}
{% if fee_due_date -%}
## Pay the ground (a) fee

You need to pay the correct fee to {{local_planning_authority}}, then email your receipt to {{team_email_address}} by {{fee_due_date}}.

{% endif -%}
{% if other_info -%}
## Other

{{other_info}}

{% endif -%}

# What happens next

{% if fee_due_date and (missing_documents.length or other_info) -%}
You need to send the missing information to {{team_email_address}} by {{due_date}} and pay the correct fee by {{fee_due_date}}.

{% elseif fee_due_date -%}
You need to pay the correct fee to {{local_planning_authority}}, then email your receipt to {{team_email_address}} by {{fee_due_date}}.

{% else -%}
You need to send the missing information to {{team_email_address}} by {{due_date}}.

{% endif -%}
Planning Inspectorate