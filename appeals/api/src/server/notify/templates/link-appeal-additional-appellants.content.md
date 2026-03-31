{% include 'parts/appeal-details.md' %}
{% if one_additional_appellant %}
We have linked the lead appeal {{lead_appeal_reference_number}} to the appeal {{child_appeal_reference_number}}.

The lead appeal {{lead_appeal_reference_number}} is for {{full_name_lead_appellant}}. We have created a linked appeal {{child_appeal_reference_number}} for {{full_name_additional_appellant}} and linked it to the lead appeal.
{% else %}
The lead appeal {{lead_appeal_reference_number}} is for {{full_name_lead_appellant}}. We have created a linked appeal for each additional appellant and have linked them to the lead appeal.

# Linked appeals
{% for childAppellantRefNumber in child_appeal_reference_number %}
#### {{childAppellantRefNumber}}
{{full_name_additional_appellant[loop.index0]}}
{% endfor %}{% endif %}{% if one_additional_appellant %}
The linked appeal will use the timetable for the lead appeal {{lead_appeal_reference_number}}.
{% else %}
All of the linked appeals will use the timetable for the lead appeal {{lead_appeal_reference_number}}.
{% endif %}
Planning Inspectorate
ECAT@planninginspectorate.gov.uk