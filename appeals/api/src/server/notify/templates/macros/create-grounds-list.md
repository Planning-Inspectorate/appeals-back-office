{% macro create_grounds_list(grounds) -%}
{% if grounds.length -%}
{% if grounds.length > 1 -%}
{%- for ground in grounds -%}
- Ground ({{ ground }})
{% endfor %}
{%- else -%}
Ground ({{ grounds[0] }})
{% endif -%}
{% endif -%}
{% endmacro -%}