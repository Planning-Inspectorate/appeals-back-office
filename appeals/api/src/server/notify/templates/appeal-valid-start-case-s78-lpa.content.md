You have a new {{appeal_type}} appeal against the application {{lpa_reference}}.

We will decide the appeal by {{procedure_type}}. You can tell us if you think a different procedure is more appropriate in the questionnaire.

{% include 'parts/appeal-details.md' %}
Start date: {{start_date}}

# Timetable

## Local planning authority questionnaire

Due by {{questionnaire_due_date}}.

## Statements from the local planning authority

Due by {{lpa_statement_deadline}}.

## Interested party comments

Due by {{ip_comments_deadline}}.

{% if final_comments_deadline -%}
## Final comments from the local planning authority

Due by {{final_comments_deadline}}.

{% endif -%}
{% if statement_of_common_ground_deadline -%}
## Statement of common ground

Due by {{statement_of_common_ground_deadline}}.

{% endif -%}
{% if planning_obligation_deadline -%}
## Planning obligation

Due by {{planning_obligation_deadline}}.

{% endif -%}

# Next steps

[Submit your questionnaire and other documents]({{front_office_url}}/manage-appeals/{{appeal_reference_number}}), including your appeal notification letter and a list of those notified by {{questionnaire_due_date}}.

The Planning Inspectorate
caseofficers@planninginspectorate.gov.uk
