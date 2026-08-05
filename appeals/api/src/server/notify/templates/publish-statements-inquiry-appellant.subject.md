{% if not has_lpa_statement and not has_ip_comments and not has_rule_6_statement -%}
	We did not receive any statements or any comments from interested parties: {{appeal_reference_number}}
{% elif not has_lpa_statement and has_rule_6_statement -%}
	Statement from a Rule 6 party: {{appeal_reference_number}}
{% elif has_rule_6_parties -%}
	Submit your proof of evidence and witnesses: {{appeal_reference_number}}
{% else -%}
	We have received the local planning authority's questionnaire, all statements and comments from interested parties: {{appeal_reference_number}}
{% endif -%}
