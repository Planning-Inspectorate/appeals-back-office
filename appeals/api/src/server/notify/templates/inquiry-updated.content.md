
{% include 'parts/appeal-details.md' %}

# About the inquiry

^Date: {{inquiry_date}}
Time: {{inquiry_time}}
{% if inquiry_expected_days -%}
Expected days: {{inquiry_expected_days}}
{% endif -%}
{% if inquiry_address -%}
Venue address: {{inquiry_address}}
{% endif %}

# What happens next

You need to attend the inquiry on {{inquiry_date}}.

The details of the inquiry are subject to change. We will contact you by email if we make any changes.

We expect the inquiry to finish on the same day. If the inquiry needs more time, you will arrange the next steps on the day.

The Planning Inspectorate
{{team_email_address}}
