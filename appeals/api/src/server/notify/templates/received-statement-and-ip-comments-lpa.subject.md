{%- if is_hearing_procedure or is_inquiry_procedure -%}
	We've received all statements and comments: {{appeal_reference_number}}
{%- elseif has_ip_comments -%}
	Submit your final comments: {{appeal_reference_number}}
{%- else -%}
	No interested party comments: {{appeal_reference_number}}
{%- endif -%}
