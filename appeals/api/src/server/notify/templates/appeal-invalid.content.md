{% include 'parts/appeal-details.md' %}

# Your appeal is not valid

We have reviewed your appeal and it is not valid.

## Why your appeal is not valid
{% for reason in reasons %}
- {{reason}}
{%- endfor %}

# What happens next

Your appeal is now closed. We have told the local planning authority.

# Feedback

This is a new service. Help us improve it and [give your feedback (opens in new tab)]({{feedback_link}}).

The Planning Inspectorate
{{team_email_address}}
