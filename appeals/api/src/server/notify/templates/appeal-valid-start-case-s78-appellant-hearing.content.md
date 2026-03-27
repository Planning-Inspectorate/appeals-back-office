We have reviewed your appeal and supporting documents.

Your appeal started on {{start_date}}. The timetable for the appeal begins from this date.

Your appeal procedure is a hearing.

{% include 'parts/appeal-details.md' %}

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
{% if hearing_expected_days -%}
Expected days: {{hearing_expected_days}}
{% endif %}
We will contact you if we make any changes to the hearing.

# What happens next

We will contact you when you can view information from other parties in the appeals service.

# Appeal costs

You may have to pay costs if you:

- behave unreasonably during your own appeal
- withdraw your appeal without good reason
- submit late evidence

[Find out more about appeal costs](https://www.gov.uk/claim-planning-appeal-costs).

The Planning Inspectorate
{{team_email_address}}
