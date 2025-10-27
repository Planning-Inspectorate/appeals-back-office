{% if is_lpa %}
You have a new {{appeal_type | lower}} appeal against the application {{lpa_reference}}.

We will decide the appeal by {{procedure_type}}. You can tell us if you think a different procedure is more appropriate in the questionnaire.
{%- else %}
We have set up your timetable.
{% endif %}

{% include 'parts/appeal-details.md' %}
Start date: {{start_date}}

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

## Statements from the local planning authority and any Rule 6 groups

Due by {{lpa_statement_deadline}}.

## Interested party comments

Due by {{ip_comments_deadline}}.

{% if statement_of_common_ground_deadline -%}

## Statement of common ground

Due by {{statement_of_common_ground_deadline}}.

{% endif -%}

## Proof of evidence and witnesses

Due by {{proof_of_evidence_and_witnesses_deadline}}.

{% if planning_obligation_deadline -%}

## Planning obligation

Due by {{planning_obligation_deadline}}.

{% endif -%}

# Inquiry details

^Date: {{inquiry_date}}
Time: {{inquiry_time}}
{% if inquiry_expected_days -%}
Expected days: {{inquiry_expected_days}}
{% endif -%}
{% if inquiry_address -%}
Venue address: {{inquiry_address}}
{% endif %}
The details of the inquiry are subject to change. We will contact you:
• if we make any changes to the inquiry
• when we set up the case management conference

# What happens next

{% if inquiry_address and is_lpa -%}

1. [Submit your questionnaire and other documents]({{front_office_url}}/manage-appeals/{{appeal_reference_number}}), including your appeal notification letter and a list of those notified by {{questionnaire_due_date}}.

2. Email {{team_email_address}} to confirm the venue address for the inquiry.
{% elseif not inquiry_address and is_lpa -%}
[Submit your questionnaire and other documents]({{front_office_url}}/manage-appeals/{{appeal_reference_number}}), including your appeal notification letter and a list of those notified by {{questionnaire_due_date}}.
{% elseif not is_lpa -%}
We will let you know when you can:
• view information from other parties in the appeals service
• submit your proof of evidence and witnesses
{% endif %}
The Planning Inspectorate
{{team_email_address}}
