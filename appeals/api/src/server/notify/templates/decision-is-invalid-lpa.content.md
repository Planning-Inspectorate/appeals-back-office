{% include 'parts/appeal-details.md' %}

# Appeal decision

We have reviewed the appeal and decided that it is not valid. We have contacted the appellant to tell them our decision.

The appeal is now closed.

# Why the appeal is not valid
{% for reason in reasons %}
- {{reason}}
{%- endfor %}
{% if has_costs_decision %}
# Costs decision

[Sign in to our service]({{front_office_url}}/manage-appeals/{{appeal_reference_number}}) to view the costs decision.
{% endif %}
# Feedback

This is a new service. Help us improve it and [give your feedback (opens in new tab)](https://forms.office.com/pages/responsepage.aspx?id=mN94WIhvq0iTIpmM5VcIjfMZj__F6D9LmMUUyoUrZDZUOERYMEFBN0NCOFdNU1BGWEhHUFQxWVhUUy4u).

The Planning Inspectorate
allcustomerteam@planninginspectorate.gov.uk
