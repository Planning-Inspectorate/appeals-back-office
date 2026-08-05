{% from 'macros/create-grounds-list.md' import create_grounds_list %}

You have a new {{appeal_type | lower}} appeal against {{enforcement_reference}}.

We will decide the appeal by a hearing. You can tell us if you think a different procedure is more appropriate in the questionnaire.

{% include 'parts/appeal-details.md' %}
Start date: {{start_date}}

{% if other_appeals_grounds_group.length -%}
# Grounds of appeal

{{ appeal_reference_number }} will continue on the following grounds:
{%- elseif appeal_grounds.length -%}
# Grounds of appeal

The appeal will continue on the following grounds:
{%- endif %}

{{ create_grounds_list(appeal_grounds) }}
{% if other_appeals_grounds_group.length -%}
{% for appeal_with_grounds in other_appeals_grounds_group -%}
{% if appeal_with_grounds.grounds.length -%}
{{ appeal_with_grounds.reference }} will continue on the following grounds:

{{ create_grounds_list(appeal_with_grounds.grounds) }}
{% endif -%}
{% endfor -%}
{% endif -%}

# Timetable

{%- if child_appeals.length === 1 %}

The timetable is the same for the linked appeal {{child_appeals[0]}}.
{%- elseif child_appeals.length > 1 %}

The timetable is the same for the following linked appeals:
{%- for child_appeal in child_appeals %}
- {{ child_appeal }}
  {%- endfor %}
  {%- endif %}

## Local planning authority questionnaire

Due by {{questionnaire_due_date}}.

## Statements

Due by {{lpa_statement_deadline}}.

## Interested party comments

Due by {{ip_comments_deadline}}.

## Final comments

Due by {{final_comments_deadline}}.

# Hearing details

^Date: {{hearing_date}}
Time: {{hearing_time}}
{% if hearing_expected_days -%}
Expected days: {{hearing_expected_days}}
{% endif -%}
{% if inspector_name -%}
Inspector: {{inspector_name}}
{% endif %}

We will contact you if we make any changes to the hearing.

# What happens next

[Submit your questionnaire and other documents]({{front_office_url}}/manage-appeals/{{appeal_reference_number}}), including your appeal notification letter and a list of those notified by {{questionnaire_due_date}}.

Email {{team_email_address}} to confirm the venue address for the hearing.

[Find out your responsibilities in the appeal process](https://www.gov.uk/government/publications/enforcement-appeals-procedural-guide).

# Notifications

You must [notify anyone you served the enforcement notice to](https://www.gov.uk/government/publications/model-notification-letter-for-enforcement-appeals) about the appeal.

# Appeal costs

You may have to pay costs if you:

- behave unreasonably during the appeal
- withdraw your enforcement notice without good reason
- submit late evidence

[Find out more about appeal costs](https://www.gov.uk/claim-planning-appeal-costs).

Planning Inspectorate
{{team_email_address}}
