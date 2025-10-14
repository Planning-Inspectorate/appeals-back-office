We have linked the child appeal {{child_appeal_reference_number}} to the lead appeal {{lead_appeal_reference_number}}.

All of the linked appeals will use the timetable for the lead appeal {{lead_appeal_reference_number}}.

{% include 'parts/appeal-details.md' %}

# What happens next

{% if linked_before_lpa_questionnaire -%}
We will contact you again when we start the appeal.

{% else -%}
There will be one {{event_type}} for all of the linked appeals.

{% endif -%}

The Planning Inspectorate
{{team_email_address}}