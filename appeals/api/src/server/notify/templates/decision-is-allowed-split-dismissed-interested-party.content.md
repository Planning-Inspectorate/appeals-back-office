{% include 'parts/appeal-details.md' %}

# Appeal decision

{%- if child_appeals.length > 1 %}

We have made a decision on the following appeals:

- {{ appeal_reference_number }} (lead)
  {%- for child_appeal in child_appeals %}
- {{ child_appeal }}
  {%- endfor %}
  {%- else %}

We have made a decision on this appeal {%- endif %}

[View the decision letter]({{front_office_url}}/appeals/{{appeal_reference_number}}) dated {{decision_date}}.

We have informed the appellant and local planning authority about the decision.

# The Planning Inspectorate's role

The Planning Inspectorate cannot change or revoke the decision. Only the High Court can change this decision.

# Feedback

We welcome your feedback on our appeals service. Tell us on this short [feedback form]({{feedback_link}}).

The Planning Inspectorate
{{case_team_email_address}}