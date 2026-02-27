We have received an enforcement appeal.

{% if other_appeals_grounds_group.length -%}
{{ appeal_reference_number }} will continue on the following grounds:
{%- else -%}
The appeal will continue on the following grounds:
{%- endif %}

{% if appeal_grounds.length -%}
{% if appeal_grounds.length > 1 -%}
{%- for ground in appeal_grounds -%}
- Ground ({{ ground }})
{% endfor %}
{%- else -%}
Ground ({{ appeal_grounds[0] }})
{% endif %}
{% endif -%}

{% if other_appeals_grounds_group.length -%}
{% if other_appeals_grounds_group.length > 1 -%}
{% for appeal_with_grounds in other_appeals_grounds_group -%}
{{ appeal_with_grounds.reference }} will continue on the following grounds:

{% if appeal_with_grounds.grounds.length -%}
{% if appeal_with_grounds.grounds.length > 1 -%}
{%- for ground in appeal_with_grounds.grounds -%}
- Ground ({{ ground }})
{% endfor %}
{%- else -%}
Ground ({{ appeal_with_grounds.grounds[0] }})
{% endif %}
{% endif -%}
{% endfor -%}
{% endif -%}
{% endif -%}
You can [view the appeal in the manage your appeals service]({{front_office_url}}/manage-appeals/{{appeal_reference_number}}).

# Appeal details

^Appeal reference number: {{appeal_reference_number}}
Address: {{site_address}}
Enforcement notice reference: {{enforcement_reference}}
{% if agent_contact_details -%}
Agent: {{agent_contact_details}}
{% endif -%}
Appellant: {{appellant_contact_details}}

{% if ground_a_barred -%}
# Ground (a) barred

We cannot consider ground (a) because the enforcement notice was issued:
- after the appellant made a related planning application
- within 2 years from the date the application or appeal made stopped being considered

The appeal does not meet the requirements for this ground from [section 174(2A to 2B) of the Town and Country Planning Act 1990](https://www.legislation.gov.uk/ukpga/1990/8/section/174).

{% endif -%}
{% if other_info and other_info != 'No' -%}
# Other information

{{ other_info }}

{% endif -%}
# What happens next

We will contact you when we start the appeal.

{% if 'a' in appeal_grounds -%}
Send an email to {{team_email_address}} to confirm if the appellant has paid the correct fee on the enforcement notice.

{% endif -%}
[Find out more about the enforcement appeal process](https://www.gov.uk/government/publications/enforcement-appeals-procedural-guide).

Planning Inspectorate
