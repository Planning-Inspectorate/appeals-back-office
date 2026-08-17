We have received the local planning authority's final comments.

You can [view this information in the appeal service]({{front_office_url}}/appeals/{{appeal_reference_number}}).

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

The Planning Inspectorate
{{team_email_address}}
