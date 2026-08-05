{% include 'parts/appeal-details.md' %}

# Appeal decision

We have reviewed this appeal and decided that it is not valid.

Appeal {{ appeal_reference_number }} is now closed.

We have informed the appellant and local planning authority about the decision.

# Why the appeal is not valid

{% for reason in reasons %}

- {{reason}}
  {%- endfor %}
  {% if has_costs_decision %}

# Costs decision

[Sign in to our service]({{front_office_url}}/appeals/{{appeal_reference_number}}) to view the costs decision.
{% endif %}

# Feedback

This is a new service. Help us improve it and [give your feedback (opens in new tab)]({{feedback_link}}).

The Planning Inspectorate
{{case_team_email_address}}