
{% include 'parts/appeal-details.md' %}
{% if inspector_name -%}
Inspector: {{inspector_name}}
{% endif %}
# Hearing details

^Date: {{hearing_date}}
Time: {{hearing_time}}
{% if hearing_expected_days -%}
Expected days: {{hearing_expected_days}}
{% endif -%}
{% if hearing_address -%}
Venue address: {{hearing_address}}
{% endif %}

# What happens next

{% if is_lpa and not hearing_address -%}
Email {{team_email_address}} to confirm the venue address for the hearing.
{% endif -%}
{% if not is_lpa and not hearing_address -%}
We will contact you when the local planning authority confirms the venue address for the hearing.
{% endif -%}
{% if hearing_address -%}
You need to attend the hearing on {{hearing_date}}.

The details of the hearing are subject to change. We will contact you by email if we make any changes.

We expect the hearing to finish on the same day. If the hearing needs more time, you will arrange the next steps on the day.
{% endif %}

The Planning Inspectorate
{{team_email_address}}
