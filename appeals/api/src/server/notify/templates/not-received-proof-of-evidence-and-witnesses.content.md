{%- if is_appellant_proof_of_evidence -%}
	We did not receive any proof of evidence and witnesses from local planning authority or any other parties:  {{appeal_reference_number}}
{%- else -%}
	We did not receive any proof of evidence and witnesses from appellant or any other parties: {{appeal_reference_number}}
{%- endif -%}

{% include 'parts/appeal-details.md' %}

{% if inquiry_address -%}
# About the inquiry

^Date: {{inquiry_date}}
Time: {{inquiry_time}}
Expected days: {{inquiry_expected_days}}
Venue address: {{inquiry_address}}

{{inquiry_detail_warning_text}}

{{inquiry_witnesses_text}}

{% endif -%}

{% if what_happens_next -%}
# What happens next

{{what_happens_next}}

{% endif -%}

The Planning Inspectorate
{{team_email_address}}
