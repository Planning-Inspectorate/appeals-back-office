# Documents received

- comments from interested parties

You can [view this information in the appeals service]({{front_office_url}}).

We did not receive a statement from the local planning authority.
We did not receive a statement from the appellant.

# Appeal details

^Appeal reference number: {{appeal_reference_number}}
Address: {{site_address}}
{% if enforcement_reference -%}
Enforcement notice reference: {{enforcement_reference}}
{%- else -%}
Planning application reference: {{lpa_reference}}
{%- endif %}

{% if hearing_date -%}
# Hearing details

^Date: {{hearing_date}}
Time: {{hearing_time}}
{% if hearing_expected_days -%}
Expected days: {{hearing_expected_days}}
{% endif -%}
{% if inspector -%}
Inspector: {{inspector}}
{% endif -%}
{% if hearing_address -%}
Venue address: {{hearing_address}}
{% endif %}

We will contact you if we make any changes to the hearing.
{% else -%}
We will contact you by email when we set up the hearing.
{% endif %}

# What happens next

You need to submit your final comments by {{final_comments_due_date}}.

Planning Inspectorate
{{team_email_address}}