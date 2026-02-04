We have reviewed your appeal and supporting documents.

Your appeal started on {{start_date}}. The timetable for the appeal begins from this date.

Your appeal procedure is {{procedure_type}}.

{% include 'parts/appeal-details.md' %}

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

{% if statement_of_common_ground_deadline -%}
## Statement of common ground

Due by {{statement_of_common_ground_deadline}}.

{% endif -%}
{% if planning_obligation_deadline -%}
## Planning obligation

Send to {{team_email_address}} by {{planning_obligation_deadline}}.

{% endif -%}

{% if procedure_type == 'written representations' -%}
## Final comments

Due by {{final_comments_deadline}}.

{% endif -%}

# What happens next

Email a copy of your appeal statement to {{team_email_address}} by {{lpa_statement_deadline}}. You will be able to view this in your appeal details.

We will send you an email when you can view information from other parties in the appeals service.

[Find out more about the enforcement appeal process](https://www.gov.uk/government/publications/enforcement-appeals-procedural-guide).

# Appeal costs

You may have to pay costs if you:

- behave unreasonably during your own appeal
- withdraw your appeal without good reason
- submit late evidence

[Find out more about appeal costs](https://www.gov.uk/claim-planning-appeal-costs).

The Planning Inspectorate
{{team_email_address}}
