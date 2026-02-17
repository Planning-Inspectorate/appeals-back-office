We have received proof of evidence and witnesses from:
{% for party in inquiry_subject_line -%}
- {{party}}
{% endfor %}

{% include 'parts/appeal-details.md' %}

# What happens next

You can [view the proof of evidence and witnesses in the appeals service]({{front_office_url}}/{{what_happens_next}}/{{appeal_reference_number}}).

The date of your inquiry is {{inquiry_date}}

The Planning Inspectorate
{{team_email_address}}
