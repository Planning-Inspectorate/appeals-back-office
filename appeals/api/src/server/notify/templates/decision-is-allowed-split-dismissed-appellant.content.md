{% include 'parts/appeal-details.md' %}

# Appeal decision

{%- if child_appeals.length > 1 %}

We have made a decision on the following appeals:
- {{ appeal_reference_number }} (lead)
  {%- for child_appeal in child_appeals %}
- {{ child_appeal }}
  {%- endfor %}
  {%- else %}

We have made a decision on your appeal.
{%- endif %}

[Sign in to our service]({{front_office_url}}/appeals/{{appeal_reference_number}}) to view the decision letter dated {{decision_date}}.

We have also informed the local planning authority of the decision.

# The Planning Inspectorate's role

The Planning Inspectorate cannot change or revoke the decision. You can [challenge the decision in the High Court](https://www.gov.uk/appeal-planning-decision/if-you-think-the-appeal-decision-is-legally-incorrect) if you think the Planning Inspectorate made a legal mistake.

# Feedback

We welcome your feedback on our appeals service. Tell us on this short [feedback form]({{feedback_link}}).

The Planning Inspectorate
[Get help with your appeal decision](https://contact-us.planninginspectorate.gov.uk/hc/en-gb/requests/new)
