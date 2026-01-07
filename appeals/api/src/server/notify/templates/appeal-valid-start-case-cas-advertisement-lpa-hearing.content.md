You have a new {{appeal_type | lower}} appeal against the application {{lpa_reference}}.

We will decide the appeal by a hearing. You can tell us if you think a different procedure is more appropriate in the questionnaire.

{% include 'parts/appeal-details.md' %}
Start date: {{start_date}}

# Timetable

## Local planning authority questionnaire
Due by {{questionnaire_due_date}}.

## Statement from the local planning authority
Due by {{lpa_statement_deadline}}.

## Interested party comments
Due by {{ip_comments_deadline}}.

{% if statement_of_common_ground_deadline -%}
## Statement of common ground
Due by {{statement_of_common_ground_deadline}}.

{% endif -%}
{% if planning_obligation_deadline -%}
## Planning obligation
Due by {{planning_obligation_deadline}}.

{% endif -%}

# Hearing details

^Date: {{hearing_date}}
Time: {{hearing_time}}

We will contact you if we make any changes to the hearing.

# What happens next

1. Email a copy of your appeal statement to {{team_email_address}} by {{questionnaire_due_date}}. You will be able to view this in your appeal details. We will email you when you can view information from other parties in the appeals service.
2. Email {{team_email_address}} to confirm the venue address for the hearing.

The Planning Inspectorate
