# Appeal details

^Appeal reference number: {{appeal_reference_number}}
Address: {{site_address}}
{% if appeal_type == 'Enforcement notice' and enforcement_reference -%}
Enforcement reference: {{enforcement_reference}}
{%- else -%}
Planning application reference: {{lpa_reference}}
{%- endif %}