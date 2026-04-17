{% if not has_ip_comments and not has_rule_6_statement -%}
   We did not receive any statements or any comments from interested parties.
{% elif has_ip_comments and has_rule_6_statement -%}
   We have received:
   - all statements
   - comments from interested parties
{% elif has_rule_6_statement -%}
   We have received a statement from a Rule 6 party.
{% elif has_ip_comments -%}
   We've received comments from interested parties.
{% else -%}
   We did not receive any comments from interested parties.
{% endif -%}

{% if has_ip_comments or has_rule_6_statement -%}
You can [view this information in the appeals service]({{front_office_url}}/manage-appeals/{{appeal_reference_number}}).
{% endif -%}

{% include 'parts/appeal-details.md' %}

# What happens next

You need to [submit your proof of evidence and witnesses]({{front_office_url}}/manage-appeals/{{appeal_reference_number}}) by {{proof_of_evidence_due_date}}.

Planning Inspectorate
{{team_email_address}}
