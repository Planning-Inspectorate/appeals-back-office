{%- if is_hearing_procedure or is_inquiry_procedure -%}
    {% if has_rule_6_parties and is_inquiry_procedure -%}
		Submit your proof of evidence and witnesses: {{appeal_reference_number}}
	{%- else -%}
		We have received the local planning authority's questionnaire, all statements and comments from interested parties: {{appeal_reference_number}}
	{%- endif -%}
{%- else -%}
	Submit your final comments: {{appeal_reference_number}}
{%- endif -%}
