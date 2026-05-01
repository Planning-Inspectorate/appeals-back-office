You have a new {{appeal_type | lower}} appeal against the application {{lpa_reference}}.

We will decide the appeal by {{procedure_type}}. You can tell us if you think a different procedure is more appropriate in the questionnaire.

{% include 'parts/appeal-details.md' %}
Start date: {{start_date}}
{% if inspector_name -%}
Inspector: {{inspector_name}}
{% endif %}
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

{% if planning_obligation_deadline -%}
## Planning obligation

Due by {{planning_obligation_deadline}}.

{% endif -%}

# What happens next

[Submit your questionnaire and other documents]({{front_office_url}}/manage-appeals/{{appeal_reference_number}}), including your appeal notification letter and a list of those notified by {{questionnaire_due_date}}.

{% endif -%}
The Planning Inspectorate
{{team_email_address}}
