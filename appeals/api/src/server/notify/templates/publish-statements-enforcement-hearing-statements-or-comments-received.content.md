{% if has_appellant_statement or has_lpa_statement or has_ip_comments -%}
# Documents received

  {%- if has_appellant_statement %}
- appellant’s statement
  {%- endif %}
  {%- if has_lpa_statement %}
- local planning authority’s statement
  {%- endif %}
  {%- if has_ip_comments %}
- comments from interested parties
  {%- endif %}

You can [view this information in the appeals service]({{front_office_url}}).

  {%- if not has_lpa_statement %}
We did not receive a statement from the local planning authority.
  {%- endif %}
  {%- if not has_appellant_statement %}
We did not receive a statement from the appellant.
  {%- endif %}
  {%- if not has_ip_comments %}
We did not receive comments from interested parties.
  {%- endif %}
{%- else %}
We did not receive a statement from the local planning authority, the appellant or any comments from interested parties.
{%- endif %}

{% include 'parts/appeal-details.md' %}

{% if hearing_date -%}
# Hearing details

^Date: {{hearing_date}}
Time: {{hearing_time}}
  {%- if hearing_expected_days %}
Expected days: {{hearing_expected_days}}
  {%- endif %}
  {%- if inspector_name %}
Inspector: {{inspector_name}}
  {%- endif %}
  {%- if hearing_address %}
Venue address: {{hearing_address}}
  {%- endif %}

We will contact you if we make any changes to the hearing.
{%- else %}
We will contact you by email when we set up the hearing.
{%- endif %}

{% if final_comments_due_date -%}
# What happens next

  {%- if recipient_role == 'appellant' and has_appellant_statement and not has_lpa_statement and not has_ip_comments %}
We will let you know if the local planning authority submits any final comments.
  {%- else %}
You need to submit your final comments by {{final_comments_due_date}}.
  {%- endif %}
{%- endif %}

Planning Inspectorate
{{team_email_address}}
