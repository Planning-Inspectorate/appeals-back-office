We have updated your timetable.

{% include 'parts/appeal-details.md' %}

# Timetable

## Local planning authority questionnaire
Due by {{lpa_questionnaire_due_date}}.

## Statements
Due by {{lpa_statement_due_date}}.

## Interested party comments
Due by {{ip_comments_due_date}}.

{% if appellant and planning_obligation_due_date -%}
## Planning obligation
Send to {{team_email_address}} by {{planning_obligation_due_date}}.

{% endif -%}
{% if final_comments_due_date -%}
## Final comments
Due by {{final_comments_due_date}}.

{% endif -%}

{% if statement_of_common_ground_due_date -%}
## Statement of common ground
Send to {{team_email_address}} by {{statement_of_common_ground_due_date}}.

{% endif -%}
{% if proof_of_evidence_and_witnesses_due_date -%}
## Proof of evidence and witnesses
Due by {{proof_of_evidence_and_witnesses_due_date}}.

{% endif -%}

Planning Inspectorate
{{team_email_address}}