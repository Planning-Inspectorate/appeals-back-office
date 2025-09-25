{% include 'parts/appeal-details.md' %}

# Your questionnaire is incomplete

We need more information before we can review your questionnaire about this appeal.

# What we need

Send the following to {{team_email_address}} by {{due_date}}:
{% for reason in reasons %}
- {{reason}}
{%- endfor %}

The Planning Inspectorate
{{team_email_address}}

