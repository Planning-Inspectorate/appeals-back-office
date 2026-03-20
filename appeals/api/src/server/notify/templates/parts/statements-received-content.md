{%- if all_others_submitted %}

    We have received:
    - all statements
    - comments from interested parties

{%- elif nothing_submitted %}

    We did not receive any statements or any comments from interested parties.

{%- else %}

    We have received:
    {%- if has_lpa_statement %}- the local planning authority's statement.{% endif %}
    {%- if has_appellant_statement %}- the appellant's statement.{% endif %}
    {%- if has_rule_6_statement %}- statements from Rule 6 parties.{% endif %}
    {%- if has_ip_comments %}- comments from interested parties.{% endif %}

    {%- if not has_statement and not has_appellant_statement and not has_rule_6_statement %} We did not receive any statements.{% endif %}
    {%- if not has_ip_comments %} We did not receive any comments from interested parties.{% endif %}

{%- endif %}
