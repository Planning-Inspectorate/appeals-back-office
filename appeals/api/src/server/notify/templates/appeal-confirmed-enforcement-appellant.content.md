We have confirmed your appeal and you have submitted all of the information we need.

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

# Appeal details

^Appeal reference number: {{appeal_reference_number}}
Address: {{site_address}}
Enforcement notice reference: {{enforcement_reference}}

{% if ground_a_barred -%}
# Ground (a) barred

We cannot consider ground (a) because the enforcement notice was issued:
- after you made a related planning application
- within 2 years from the date the application or appeal made stopped being considered

Your appeal does not meet the requirements for this ground from [section 174(2A to 2B) of the Town and Country Planning Act 1990](https://www.legislation.gov.uk/ukpga/1990/8/section/174).

{% endif -%}
{% if other_info and other_info != 'No' -%}
# Other information

{{ other_info }}

{% endif -%}
# What happens next

1. Download a copy of your appeal form.
2. [Find the email address for your local planning authority](https://www.gov.uk/government/publications/sending-a-copy-of-the-appeal-form-to-the-council/sending-a-copy-to-the-council).
3. Email the copy of your appeal form and the documents you uploaded to: {{local_planning_authority}}.

You must send a copy of your appeal form and documents to the local planning authority, it’s a legal requirement.

[Find out about the enforcement appeals process](https://www.gov.uk/government/publications/enforcement-appeals-procedural-guide).

# Give feedback

[Give feedback on the appeals service]({{feedback_link}}) (takes 2 minutes)

Planning Inspectorate
{{team_email_address}}
