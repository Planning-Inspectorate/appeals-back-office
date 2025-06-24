We have reviewed your appeal and supporting documents.

Your appeal started on {{start_date}}. The timetable for the appeal begins from this date.

Your appeal procedure is {{procedure_type}}.

{% include 'parts/appeal-details.md' %}

# Timetable

## Local planning authority questionnaire

Due by {{questionnaire_due_date}}.

## Statements from the local planning authority

Due by {{lpa_statement_deadline}}.

## Interested party comments

Due by {{ip_comments_deadline}}.

{% if final_comments_deadline -%}
## Final comments from you and the local planning authority

Due by {{final_comments_deadline}}.

{% endif -%}

# What happens next

{% if we_will_email_when is string -%}
We will send you an email {{ we_will_email_when }}
{%- else -%}
We will send you another email:
{% for line in we_will_email_when %}
- {{ line }}
{%- endfor %}
{%- endif %}

# Appeal costs

You may have to pay costs if you:

- behave unreasonably during your own appeal
- withdraw your appeal without good reason
- submit late evidence

[Find out more about appeal costs](https://www.gov.uk/claim-planning-appeal-costs).

The Planning Inspectorate
caseofficers@planninginspectorate.gov.uk
