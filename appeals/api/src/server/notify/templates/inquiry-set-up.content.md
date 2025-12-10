
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

The Planning Inspectorate
{{team_email_address}}
