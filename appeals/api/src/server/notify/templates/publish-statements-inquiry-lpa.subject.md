{% if not has_ip_comments and not has_rule_6_statement -%}
   We did not receive any statements or any comments from interested parties: {{appeal_reference_number}}
{% elif has_ip_comments and has_rule_6_statement -%}
	We've received all statements and comments: {{appeal_reference_number}}
{% elif has_rule_6_statement -%}
   Statement from a Rule 6 party: {{appeal_reference_number}}
{% else -%}
   Submit your proof of evidence and witnesses: {{appeal_reference_number}}
{% endif -%}
