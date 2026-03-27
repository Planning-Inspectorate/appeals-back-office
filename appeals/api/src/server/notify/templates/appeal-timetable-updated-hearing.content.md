We have updated your timetable.

{% include 'parts/appeal-details.md' %}

# Timetable

## Local planning authority questionnaire
Due by {{lpa_questionnaire_due_date}}.

## Statement from the local planning authority
Due by {{lpa_statement_due_date}}.

## Interested party comments
Due by {{ip_comments_due_date}}.

{% if statement_of_common_ground_due_date -%}
## Statement of common ground
Due by {{statement_of_common_ground_due_date}}.

{% endif -%}
{% if planning_obligation_due_date -%}
## Planning obligation
Due by {{planning_obligation_due_date}}.

{% endif -%}
The Planning Inspectorate
{{team_email_address}}
