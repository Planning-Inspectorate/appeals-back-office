We have received an application for costs on appeal {{appeal_reference_number}}.

{% include 'parts/appeal-details.md' %}

# What happens next
[View this application in the appeals service]({{front_office_url}}{{dashboard_link}}/{{appeal_reference_number}}).

{% if responses_invited %}

Send an email to {{contact_email}} by {{deadline}} if you want to respond to this comment. 
[You can view all comments in the appeals service.]({{front_office_url}}{{dashboard_link}}/{{appeal_reference_number}})

{% endif %}

Planning Inspectorate 

{{contact_email}}