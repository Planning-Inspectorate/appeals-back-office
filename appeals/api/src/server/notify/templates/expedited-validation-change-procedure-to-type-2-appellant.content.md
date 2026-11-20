We are reviewing the procedure type for appeal {{appeal_reference_number}}. It will follow the {{appeal_procedure}} procedure.

You will need to provide additional documents.

{% include 'parts/appeal-details.md' %}

# What happens next

Submit your additional documents to {{team_email_address}} and to your local planning authority by {{due_date}}.

{% if appeal_procedure == 'written representations (part 2)' -%}
• your appeal statement
• all the plans and drawings you submitted with your planning application
• any supporting documents you submitted with your planning application
• any other supporting documents

{% endif -%}
{% if appeal_procedure == 'inquiry' or appeal_procedure == 'hearing'-%}
• your appeal statement
• your statement of common ground
• all the plans and drawings you submitted with your planning application
• any supporting documents you submitted with your planning application
• any other supporting documents

{% endif -%}

Find out more about [the appeal procedures](https://www.gov.uk/government/publications/enforcement-appeals-procedural-guide) and the documents you need to submit for each of them.

We will send you an email when you can view information from other parties in the appeals service.

Planning Inspectorate
{{team_email_address}}