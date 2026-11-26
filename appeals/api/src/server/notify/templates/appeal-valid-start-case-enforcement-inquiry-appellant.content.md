{% from 'macros/create-grounds-list.md' import create_grounds_list %}

You have a new {{appeal_type | lower}} appeal against {{enforcement_reference}}.

We will decide the appeal by inquiry. You can tell us if you think a different procedure is more appropriate in the questionnaire.

{% include 'parts/appeal-details.md' %}
Start date: {{start_date}}

{% if inspector_name -%}
Inspector: {{inspector_name}}
{% endif %}
{% if other_appeals_grounds_group.length -%}
# Grounds of appeal

{{ appeal_reference_number }} will continue on the following grounds:
{%- elseif appeal_grounds.length -%}
# Grounds of appeal

The appeal will continue on the following grounds:
{%- endif %}

{{ create_grounds_list(appeal_grounds) }}
{% if other_appeals_grounds_group.length -%}
{% for appeal_with_grounds in other_appeals_grounds_group -%}
{% if appeal_with_grounds.grounds.length -%}
{{ appeal_with_grounds.reference }} will continue on the following grounds:

{{ create_grounds_list(appeal_with_grounds.grounds) }}
{% endif -%}
{% endfor -%}
{% endif -%}

# Timetable

Enforcement appeals are currently taking longer than usual. Find out about the [average handling times for appeals](https://www.gov.uk/guidance/appeals-how-long-they-take).

{%- if child_appeals.length === 1 %}

The timetable is the same for the linked appeal {{child_appeals[0]}}.
{%- elseif child_appeals.length > 1 %}

The timetable is the same for the following linked appeals:
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

## Statement of common ground

{% if statement_of_common_ground_deadline -%}
Send to {{team_email_address}} by {{statement_of_common_ground_deadline}}.
{% else -%}
We will let you know when you can submit your statement of common ground.
{% endif %}

## Final comments

Due by {{final_comments_deadline}}.

## Proof of evidence and witnesses

Due by {{proof_of_evidence_and_witnesses_deadline}}.

## Case management conference

{% if case_management_conference_deadline -%}
Date: {{case_management_conference_deadline}}.
{% else -%}
We will contact you when we set up your case management conference.
{% endif %}

# Inquiry details

^Date: {{inquiry_date}}
Time: {{inquiry_time}}
{% if inquiry_expected_days -%}
Expected days: {{inquiry_expected_days}}
{% endif -%}
{% if inquiry_address -%}
Venue address: {{inquiry_address}}
{% endif %}
The details of the inquiry are subject to change. We will contact you if we make any changes to the inquiry.

Your witnesses should be available for the duration of the inquiry.

# What happens next

{% if not inquiry_address -%}
1. [Submit your questionnaire and other documents]({{front_office_url}}/manage-appeals/{{appeal_reference_number}}), including your appeal notification letter and a list of those notified by {{questionnaire_due_date}}.

2. Email {{team_email_address}} to confirm the venue address for the inquiry.
{% else -%}
[Submit your questionnaire and other documents]({{front_office_url}}/manage-appeals/{{appeal_reference_number}}), including your appeal notification letter and a list of those notified by {{questionnaire_due_date}}.
{% endif %}

[Find out more about your responsibilities in the appeal process](https://www.gov.uk/government/publications/enforcement-appeals-procedural-guide).

# Notifications

You must [notify anyone you served the enforcement notice to](https://www.gov.uk/government/publications/model-notification-letter-for-enforcement-appeals) about the appeal.

# Appeal costs

You may have to pay costs if you:

- behave unreasonably during the appeal
- withdraw your enforcement notice without good reason
- submit late evidence

[Find out more about appeal costs](https://www.gov.uk/claim-planning-appeal-costs).

Planning Inspectorate
{{team_email_address}}
