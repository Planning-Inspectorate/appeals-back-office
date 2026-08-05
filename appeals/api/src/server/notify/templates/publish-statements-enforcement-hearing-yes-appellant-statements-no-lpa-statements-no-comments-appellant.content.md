# Documents recieved
- appellant’s statement

You can [view this information in the appeals service]({{front_office_url}}).

We did not receive a statement from the local planning authority.
We did not receive comments from interested parties.

{% include 'parts/appeal-details.md' %}

{% if hearing_date -%}
# Hearing details
Date: {{hearing_date}}
Time: {{hearing_time}}
{% if hearing_expected_days -%}
Expected days: {{hearing_expected_days}}
{% endif %}
{% if inspector_name -%}
Inspector: {{inspector_name}}
{% endif %}
{% if hearing_address -%}
Venue address: {{hearing_address}}
{% endif %}
We will contact you if we make any changes to the hearing.
{% else -%}
We will contact you by email when we set up the hearing.
{% endif %}

# What happens next
We will let you know if the local planning authority submits any final comments.

Planning Inspectorate
{{team_email_address}}