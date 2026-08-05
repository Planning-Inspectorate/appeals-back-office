{% if not has_lpa_statement and not has_ip_comments and not has_rule_6_statement -%}
   We did not receive any statements or any comments from interested parties.
{% elif not has_lpa_statement and has_rule_6_statement -%}
   We have received your statement.
{% elif has_lpa_statement and has_rule_6_statement -%}
   We have received:
   - all statements
   - comments from interested parties
{% elif has_lpa_statement and has_rule_6_parties and not has_rule_6_statement -%}
   We have received the local planning authority's questionnaire and any comments from interested parties.
{% elif has_lpa_statement and has_ip_comments -%}
   We have received the local planning authority's questionnaire, all statements and comments from interested parties.
{% elif has_lpa_statement -%}
   We have received a statement from the local planning authority.
{% elif has_ip_comments -%}
   We have received comments from interested parties.
{% endif -%}

{% if has_lpa_statement or has_ip_comments -%}
   You can [view this information in the appeals service]({{front_office_url}}/rule-6/{{appeal_reference_number}}).
{% endif -%}

{% if has_lpa_statement or has_ip_comments or has_rule_6_statement -%}
{% if not has_lpa_statement -%}
   The local planning authority did not submit a statement.
{% endif -%}
{% if not has_ip_comments -%}
   We did not receive any comments from interested parties.
{% endif -%}
{% endif -%}

{% include 'parts/appeal-details.md' %}

# What happens next

{% if not has_lpa_statement and has_rule_6_statement -%}
   We will contact you when:
   - the local planning authority and any other parties have submitted their statements
   - we have received comments from interested parties
{% else -%}
   You need to [submit your proof of evidence and witnesses]({{front_office_url}}/rule-6/{{appeal_reference_number}}) by {{proof_of_evidence_due_date}}.
{% endif %}
Planning Inspectorate
{{team_email_address}}
