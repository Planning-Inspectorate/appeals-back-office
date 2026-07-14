You have a new {{appeal_type | lower}} against the application {{lpa_reference}}

[You can view the appeal in the appeals service]({{front_office_url}}/manage-appeals/{{appeal_reference_number}}).

# Appeal details

^Appeal reference number: {{appeal_reference_number}}
Address: {{site_address}}
Reference number: {{lpa_reference}}
{% if agent_contact_details -%}
Agent: {{agent_contact_details}}
{% endif -%}
Appellant: {{appellant_contact_details}}
{% if ldc_type -%}
Lawful development certificate type: {{ldc_type}}
{%- endif %}

# What happens next
We will contact you when we start the appeal.

{% if ldc_type -%}
[Find out more about the lawful development certificate appeal process](https://www.gov.uk/government/publications/certificate-of-lawful-use-or-development-appeals-procedural-guide).
{%- endif %}

Planning Inspectorate
{{team_email_address}}

