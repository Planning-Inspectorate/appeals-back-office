You have a new {{appeal_type | lower}} appeal against the application {{lpa_reference}}.

We will decide the appeal by {{procedure_type}}.

There will be no local planning authority statement, interested party comments or final comments.

You can tell us if you think a different procedure is more appropriate in the questionnaire.

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

# What happens next

[Submit your questionnaire]({{front_office_url}}/manage-appeals/{{appeal_reference_number}}), including the appropriate appeal notification letter by {{questionnaire_due_date}}.

You do not need to ask interested parties for comments when you notify them.

The Planning Inspectorate
{{team_email_address}}
