{% if is_lpa -%}
New {{appeal_type | lower}} appeal: {{appeal_reference_number}}
  {%- else %}
We have set up your timetable: {{appeal_reference_number}}
{% endif -%}