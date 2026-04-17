{% if not has_lpa_statement and not has_ip_comments and not has_rule_6_statement -%}
   We did not receive any statements or any comments from interested parties: {{appeal_reference_number}}
{% elif has_lpa_statement and has_rule_6_statement -%}
   We have received your statement: {{appeal_reference_number}}
{% else -%}
   Submit your proof of evidence and witnesses: {{appeal_reference_number}}
{% endif -%}
