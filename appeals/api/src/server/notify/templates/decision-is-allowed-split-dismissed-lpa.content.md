{% include 'parts/appeal-details.md' %}

# Appeal decision

{%- if child_appeals.length > 1 %}

We have made a decision on the following appeals:
- {{ appeal_reference_number }} (lead)
{%- for child_appeal in child_appeals %}
- {{ child_appeal }}
{%- endfor %}
{%- else %}

We have made a decision on this appeal.
{%- endif %}

[Sign in to our service]({{front_office_url}}/manage-appeals/{{appeal_reference_number}}) to view the decision letter dated {{decision_date}}.

We have also informed the appellant of the decision.

# The Planning Inspectorate's role

The Planning Inspectorate cannot change or revoke the decision. You can [challenge the decision in the High Court](https://www.gov.uk/appeal-planning-decision/if-you-think-the-appeal-decision-is-legally-incorrect) if you think the Planning Inspectorate made a legal mistake.

# Feedback

We welcome your feedback on our appeals service. Tell us on this short [feedback form](https://forms.office.com/pages/responsepage.aspx?id=mN94WIhvq0iTIpmM5VcIjfMZj__F6D9LmMUUyoUrZDZUOERYMEFBN0NCOFdNU1BGWEhHUFQxWVhUUy4u).

The Planning Inspectorate
enquiries@planninginspectorate.gov.uk