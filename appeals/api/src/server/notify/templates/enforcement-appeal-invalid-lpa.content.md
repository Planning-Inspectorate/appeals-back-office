We have reviewed the appeal and it is not valid.

# Appeal details

^Appeal reference number: {{appeal_reference_number}}
Address: {{site_address}}
Enforcement notice reference: {{enforcement_reference}}

{% if reasons.length -%}
# Why the appeal is invalid
{% if reasons.length > 1 -%}
{%- for reason in reasons -%}
- {{ reason }}
{% endfor %}
{%- else -%}
{{ reasons[0] }}
{% endif %}
{% endif -%}
{% if ground_a_barred -%}

# Ground (a) barred
We cannot consider ground (a) because the enforcement notice was issued:
* after you made a related planning application
* within 2 years from the date the application or appeal made stopped being considered

The appeal does not meet the requirements for this ground from section 174(2A to 2B) of the Town and Country Planning Act 1990.

{% endif -%}

# What happens next
The appeal is now closed.

{%- if other_live_appeals %}
The enforcement notice will not take effect unless we dismiss the other appeal or someone withdraws it.
{%- else %}
The compliance period for the enforcement notice starts from {{effective_date}}.
{%- endif %}

Planning Inspectorate
{{team_email_address}}