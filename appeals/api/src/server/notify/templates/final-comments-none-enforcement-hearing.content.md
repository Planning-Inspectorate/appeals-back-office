Neither the local planning authority or the appellant submitted any final comments.

{% include 'parts/appeal-details.md' %}

{% if hearing_date -%}
# Hearing details

^Date: {{hearing_date}}
Time: {{hearing_time}}
{% if hearing_expected_days -%}
Expected days: {{hearing_expected_days}}
{% endif -%}
{% if inspector -%}
Inspector: {{inspector}}
{% endif -%}
{% if hearing_address -%}
Venue address: {{hearing_address}}
{% endif %}

We will contact you if we make any changes to the hearing.
{% else -%}
We will contact you by email when we set up the hearing.
{% endif %}

Planning Inspectorate
{{team_email_address}}