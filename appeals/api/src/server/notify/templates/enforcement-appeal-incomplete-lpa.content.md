We have asked the appellant to submit missing information.

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
{% if grounds_and_facts.length -%}
## Grounds and facts do not match

{% if grounds_and_facts.length > 1 -%}
{%- for grounds_and_fact in grounds_and_facts -%}
- {{ grounds_and_fact }}
{% endfor %}
{%- else -%}
{{ grounds_and_facts[0] }}
{% endif %}
{% endif -%}
{% if fee_due_date -%}
## Pay the ground (a) fee

{% endif -%}
{% if other_info -%}
## Other

{{other_info}}

{% endif -%}

{% set ground_a_fee_message %}
{%- if appeal_grounds.length === 1 and appeal_grounds[0] === 'a' -%}
If you do not receive the correct fee by {{fee_due_date}} we will close the appeal.
{%- else -%}
If you do not receive the correct fee by {{fee_due_date}} ground (a) will not continue.
{%- endif -%}
{% endset -%}
# What happens next

{% if fee_due_date and (missing_documents.length or other_info or grounds_and_facts.length) -%}
The appellant needs to send the missing information to us by {{due_date}} and pay the fee by {{fee_due_date}}.

Send an email to {{team_email_address}} to confirm when you receive the fee. Include the details of each appellant that pays the fee.

{{ ground_a_fee_message }}

{% elseif fee_due_date -%}
The appellant needs to pay the fee by {{fee_due_date}}.

Send an email to {{team_email_address}} to confirm when you receive the fee. Include the details of each appellant that pays the fee.

{{ ground_a_fee_message }}

{% else -%}
The appellant needs to send the missing information to us by {{due_date}}.

{% endif -%}
Planning Inspectorate