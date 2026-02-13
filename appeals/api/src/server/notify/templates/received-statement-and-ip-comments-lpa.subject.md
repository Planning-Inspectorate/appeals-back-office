{%- if is_hearing_procedure or is_inquiry_procedure -%}
	{% if has_rule_6_statement and is_inquiry_procedure -%}
		Submit your proof of evidence and witnesses: {{appeal_reference_number}}
	{%- else -%}
		We've received all statements and comments: {{appeal_reference_number}}
	{%- endif -%}
{%- elseif has_ip_comments -%}
	Submit your final comments: {{appeal_reference_number}}
{%- else -%}
	No interested party comments: {{appeal_reference_number}}
{%- endif -%}
