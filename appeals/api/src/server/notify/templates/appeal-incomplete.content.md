{% include 'parts/appeal-details.md' %}

We have received your appeal and we need more information.

# Next steps

You need to submit the following by {{due_date}} to {{team_email_address}}
{% for reason in reasons %}
- {{reason}}
{%- endfor %}

The Planning Inspectorate
{{team_email_address}}

