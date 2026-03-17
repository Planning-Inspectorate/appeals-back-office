{% if is_lpa %}
You have a new {{appeal_type | lower}} appeal against the application {{lpa_reference}}.

We will decide the appeal by inquiry. You can tell us if you think a different procedure is more appropriate in the questionnaire.
{%- else %}
We have set up your timetable.
{% endif %}

{% include 'parts/appeal-details.md' %}
{% if is_lpa -%}
Start date: {{start_date}}
{% endif %}
# Timetable

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

- if we make any changes to the inquiry
- when we set up the case management conference

# What happens next

{% if not inquiry_address and is_lpa -%}

1. Email a copy of your appeal statement to {{team_email_address}} by {{questionnaire_due_date}}. You will be able to view this in your appeal details. We will email you when you can view information from other parties in the appeals service.

2. Email {{team_email_address}} to confirm the venue address for the inquiry.
{% elseif inquiry_address and is_lpa -%}
Email a copy of your appeal statement to {{team_email_address}} by {{questionnaire_due_date}}. You will be able to view this in your appeal details.
{% elseif not is_lpa -%}
We will let you know when you can:

- view information from other parties in the appeals service
- submit your proof of evidence and witnesses
{% endif %}
The Planning Inspectorate
{{team_email_address}}
