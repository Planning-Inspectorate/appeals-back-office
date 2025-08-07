We have rejected your comment.

{% include 'parts/appeal-details.md' %}

## Why we rejected your comment

We rejected your comment because:
{% for reason in reasons %}
- {{reason}}
{%- endfor %}

# What happens next

{% if resubmit_comment_to_fo -%}
    You can [submit a different comment]({{front_office_url}}/comment-planning-appeal/enter-appeal-reference) by {{deadline_date}}.

{% else -%}
    You can send a different comment to [caseofficers@planninginspectorate.gov.uk](mailto:caseofficers@planninginspectorate.gov.uk) by {{deadline_date}}.

{% endif -%}

The Planning Inspectorate
[enquiries@planninginspectorate.gov.uk](mailto:enquiries@planninginspectorate.gov.uk)
