We have updated your timetable.

{% include 'parts/appeal-details.md' %}

# Timetable

## Local planning authority questionnaire
Due by {{lpa_questionnaire_due_date}}.

## Statements from the local planning authority and any Rule 6 groups
Due by {{lpa_statement_due_date}}.

## Interested party comments
Due by {{ip_comments_due_date}}.

{% if statement_of_common_ground_due_date -%}
## Statement of common ground
Due by {{statement_of_common_ground_due_date}}.

{% endif -%}
## Proof of evidence and witnesses
Due by {{proof_of_evidence_and_witnesses_due_date}}.

{% if planning_obligation_due_date -%}
## Planning obligation
Due by {{planning_obligation_due_date}}.

{% endif -%}
## Case management conference
Due by {{case_management_conference_due_date}}.

The Planning Inspectorate
{{team_email_address}}
