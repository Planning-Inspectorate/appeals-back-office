{% if sharing_multiple_documents %}
We have received multiple documents for appeal {{appeal_reference_number}}.

{% elseif not  sharing_multiple_documents %}
We have received the document {{document_name}} for appeal {{appeal_reference_number}}.

{% endif %}


# What happens next
{% if sharing_multiple_documents %}
You can [view the documents in the appeals service]({{front_office_url}}/{{dashboard_link}}/{{appeal_reference_number}}/{{document_type}}).

{% elseif not  sharing_multiple_documents %}

You can [view the document in the appeals service]({{front_office_url}}/{{dashboard_link}}/{{appeal_reference_number}}/{{document_type}}).
{% endif %}

{% if responses_invited %}

If you want to respond to {{document_name}}, send an email to {{contact_email}} by {{deadline}}.

{% endif %}

Planning Inspectorate
{{contact_email}}
