You have a new {{appeal_type | lower}} appeal against {{enforcement_reference}}.

We will decide the appeal by {{procedure_type}}. You can tell us if you think a different procedure is more appropriate in the questionnaire.

{% include 'parts/appeal-details.md' %}
Start date: {{start_date}}

{% if appeal_grounds.length -%}
# Grounds of appeal

{% if appeal_grounds.length > 1 -%}
{%- for ground in appeal_grounds -%}
- Ground ({{ ground }})
{% endfor %}
{%- else -%}
Ground ({{ appeal_grounds[0] }})
{% endif %}
{% endif -%}
# Timetable

{%- if child_appeals.length === 1 %}

The timetable is the same for the child appeal {{child_appeals[0]}}.
{%- elseif child_appeals.length > 1 %}

The timetable is the same for the following child appeals:
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

{% if procedure_type == 'written representations' -%}
## Final comments

Due by {{final_comments_deadline}}.

{% endif -%}
{% if statement_of_common_ground_deadline -%}
## Statement of common ground

Due by {{statement_of_common_ground_deadline}}.

{% endif -%}

# What happens next

[Submit your questionnaire and other documents]({{front_office_url}}/manage-appeals/{{appeal_reference_number}}), including your appeal notification letter and a list of those notified by {{questionnaire_due_date}}.

[Find out your responsibilities in the appeal process](https://www.gov.uk/government/publications/enforcement-appeals-procedural-guide).

# Notifications

You must [notify anyone you served the enforcement notice to](https://www.gov.uk/government/publications/model-notification-letter-for-enforcement-appeals) about the appeal.

The Planning Inspectorate
{{team_email_address}}
