We have received the {{submitting_party}}'s final comments.

You can [view this information in the appeal service]({{front_office_url}}/{{fo_dashboard_stub}}/{{appeal_reference_number}}).

{% include 'parts/appeal-details.md' %}

{% if hearing_date -%}
{% include 'parts/hearing-details.md' %}
We will contact you if we make any changes to the hearing.
{% else -%}
We will contact you by email when we set up the hearing.
{% endif %}

The Planning Inspectorate
{{team_email_address}}
