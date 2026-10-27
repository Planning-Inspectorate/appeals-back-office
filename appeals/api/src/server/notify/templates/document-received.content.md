{%- if sharing_multiple_documents -%}
We have received multiple documents for appeal {{appeal_reference_number}}.
{%- elseif not  sharing_multiple_douments -%}
We have received the document {{document_name}} for appeal {{appeal_reference_number}}.
{% endif %}


# What happens next
{% if sharing_multiple_documents -%}
You can [view the documents]({{front_office_url}}/{{dashboard_link}}/{{appeal_reference_number}}/{{document_type}}) 
in the {{document_folder_name}} folder of the appeals service.
{%- elseif not  sharing_multiple_documents -%}
You can [view the document]({{front_office_url}}/{{dashboard_link}}/{{appeal_reference_number}}/{{document_type}}) in the {{document_folder_name}} folder of the appeals service.
{% endif -%}

{% if responses_invited %}

You can respond to this document if you did not send it. If you want to respond to {{document_name}}, send an email to {{contact_email}} by {{deadline}}.

{% endif %}

Planning Inspectorate
{{contact_email}}


