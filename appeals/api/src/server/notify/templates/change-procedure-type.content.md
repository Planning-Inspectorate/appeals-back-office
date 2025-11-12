{{change_message}}

{% include 'parts/appeal-details.md' %}

{% if appeal_procedure == 'inquiry' -%}

# Inquiry details

^Date: {{inquiry_date}}
Time: {{inquiry_time}}
{% if inquiry_expected_days -%}
Expected days: {{inquiry_expected_days}}
{% endif -%}
{% if inquiry_address -%}
Venue address: {{inquiry_address}}

{% endif -%}

The details of the inquiry are subject to change. We will contact you by email if we make any changes.

Your witnesses should be available for the duration of the inquiry.

# Before the inquiry

The inspector will hold a case management conference with the main parties on Teams.

We will send an email with the conference details. You should only have one spokesperson.

{% endif -%}
{% if appeal_procedure == 'hearing' and hearing_date -%}

# Hearing details

^Date: {{hearing_date}}
Time: {{hearing_time}}

We will contact you if we make any changes to the hearing.

{% endif -%}

{% if appeal_procedure == 'written' or appeal_procedure == 'inquiry' -%}

# What happens next

{% if appeal_procedure == 'written' -%}
{% if lpa_statement_exists and is_lpa -%}
You need to [submit a new statement]({{front_office_url}}/manage-appeals/{{appeal_reference_number}}).

{% endif -%}

We will send you another email when:
• you can [submit your final comments]({{front_office_url}}/manage-appeals/{{appeal_reference_number}})
• we set up the site visit

{% endif -%}
{% if appeal_procedure == 'inquiry' and existing_appeal_procedure == 'written'-%}

You need to:

{% if lpa_statement_exists and is_lpa -%}
• You need to [submit a new statement]({{front_office_url}}/manage-appeals/{{appeal_reference_number}}).
{% endif -%}
• send the contact details of your spokesperson and any other participants to {{team_email_address}} by {{week_before_conference_date}}
• [submit proof of evidence and witnesses]({{front_office_url}}/manage-appeals/{{appeal_reference_number}}) by {{proof_of_evidence_due_date}}
• attend the inquiry on {{inquiry_date}}

{% endif -%}
{% if appeal_procedure == 'inquiry' and existing_appeal_procedure == 'hearing'-%}
{% if lpa_statement_exists and is_lpa -%}
You need to [submit a new statement]({{front_office_url}}/manage-appeals/{{appeal_reference_number}}).

{% endif -%}
We will send you another email when you can [submit your proof of evidence and witnesses]({{front_office_url}}/manage-appeals/{{appeal_reference_number}}).

{% endif -%}
{% endif -%}

{% if appeal_procedure == 'hearing' and is_lpa and lpa_statement_exists -%}
# What happens next

You need to [submit a new statement]({{front_office_url}}/manage-appeals/{{appeal_reference_number}}).

{% endif -%}

The Planning Inspectorate
{{team_email_address}}
