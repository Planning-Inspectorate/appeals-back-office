{{inquiry_subject_line}}.

{% include 'parts/appeal-details.md' %}

# About the inquiry

^Date: {{inquiry_date}}
Time: {{inquiry_time}}
Expected days: {{inquiry_expected_days}}
{% if inquiry_address -%}
Venue address: {{inquiry_address}}

{% endif -%}
{{inquiry_detail_warning_text}}

{{inquiry_witnesses_text}}

{% if what_happens_next -%}
# What happens next

{{what_happens_next}}

{% endif -%}

The Planning Inspectorate
{{team_email_address}}
