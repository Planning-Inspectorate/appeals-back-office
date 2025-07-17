We have rejected your comment.

{% include 'parts/appeal-details.md' %}

## Why we rejected your comment

We rejected your comment because:
{% for reason in reasons %}
- {{reason}}
{%- endfor %}

# What happens next

{% if ip_comment_due_before_resubmission_deadline -%}
    You can submit a different comment by {{deadline_date}}.

{% else -%}
    You can send a different comment to caseofficers@planninginspectorate.gov.uk by {{deadline_date}}.

{% endif -%}

The Planning Inspectorate
caseofficers@planninginspectorate.gov.uk

