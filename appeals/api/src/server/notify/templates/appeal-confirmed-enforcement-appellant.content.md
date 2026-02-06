We have confirmed your appeal and you have submitted all of the information we need.

The appeal will continue on the following grounds:

{% if appeal_grounds.length -%}
{% if appeal_grounds.length > 1 -%}
{%- for ground in appeal_grounds -%}
- Ground ({{ ground }})
{% endfor %}
{%- else -%}
Ground ({{ appeal_grounds[0] }})
{% endif %}
{% endif -%}
{% include 'parts/appeal-details.md' %}

{% if ground_a_barred -%}
# Ground (a) barred

We cannot consider ground (a) because the enforcement notice was issued:
- after you made a related planning application
- within 2 years from the date the application or appeal made stopped being considered

Your appeal does not meet the requirements for this ground from [section 174(2A to 2B) of the Town and Country Planning Act 1990](https://www.legislation.gov.uk/ukpga/1990/8/section/174).

{% endif -%}
{% if other_info -%}
# Other information

{{ other_info }}

{% endif -%}
# What happens next

1. We will send you an email when we have reviewed the other information you have provided.
2. [Find the email address for your local planning authority](https://www.gov.uk/government/publications/sending-a-copy-of-the-appeal-form-to-the-council/sending-a-copy-to-the-council).
3. Email the copy of your appeal form and the documents you uploaded to: Bristol City Council.

[Find out about the enforcement appeals process](https://www.gov.uk/government/publications/enforcement-appeals-procedural-guide).

# Give feedback

[Give feedback on the appeals service]({{feedback_link}}) (takes 2 minutes)

The Planning Inspectorate
{{team_email_address}}
