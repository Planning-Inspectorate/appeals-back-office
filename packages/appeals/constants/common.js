export const ODW_SYSTEM_ID = 'back-office-appeals';
export const APPEAL_START_RANGE = 6000000;

export const EVENT_TYPE = Object.freeze({
	SITE_VISIT: 'siteVisit',
	HEARING: 'hearing',
	INQUIRY: 'inquiry'
});

export const FEATURE_FLAG_NAMES = Object.freeze({
	SECTION_78: 'featureFlagS78Written',
	SECTION_78_INQUIRY: 'featureFlagS78Inquiry',
	NET_RESIDENCE: 'featureFlagNetResidence',
	NET_RESIDENCE_S20: 'featureFlagNetResidenceS20',
	CAS: 'featureFlagCAS',
	CAS_ADVERT: 'featureFlagCasAdvert',
	LINKED_APPEALS: 'featureFlagLinkedAppeals',
	CHANGE_PROCEDURE_TYPE: 'featureFlagChangeProcedureType',
	ADVERTISEMENT: 'featureFlagAdvertisement',
	HEARING_POST_MVP: 'featureFlagHearingPostMvp',
	AUTO_ASSIGN_TEAM: 'featureFlagAutoAssignTeam',
	SEARCH_CASE_OFFICER: 'featureFlagSearchCaseOfficer',
	ENFORCEMENT_NOTICE: 'featureFlagEnforcementNotice',
	INVALID_DECISION_LETTER: 'featureFlagInvalidDecisionLetter',
	RULE_6_PARTIES: 'featureFlagRule6Parties',
	EXPEDITED_APPEALS: 'featureFlagExpeditedAppeals',
	MANUALLY_ADD_REPS: 'featureFlagManuallyAddReps',
	APPELLANT_STATEMENT: 'featureFlagAppellantStatement',
	LDC: 'featureFlagLDC'
});

export const APPEAL_TYPE = Object.freeze({
	HOUSEHOLDER: 'Householder',
	S78: 'Planning appeal',
	ENFORCEMENT_NOTICE: 'Enforcement notice appeal',
	ENFORCEMENT_LISTED_BUILDING: 'Enforcement listed building and conservation area appeal',
	DISCONTINUANCE_NOTICE: 'Discontinuance notice appeal',
	ADVERTISEMENT: 'Advertisement',
	COMMUNITY_INFRASTRUCTURE_LEVY: 'Community infrastructure levy',
	PLANNING_OBLIGATION: 'Planning obligation appeal',
	AFFORDABLE_HOUSING_OBLIGATION: 'Affordable housing obligation appeal',
	CALL_IN_APPLICATION: 'Call-in application',
	LAWFUL_DEVELOPMENT_CERTIFICATE: 'Lawful development certificate appeal',
	PLANNED_LISTED_BUILDING: 'Planning listed building and conservation area appeal',
	CAS_PLANNING: 'CAS planning',
	CAS_ADVERTISEMENT: 'CAS advert'
});

export const APPEAL_TYPE_CHANGE_APPEALS = Object.freeze({
	HOUSEHOLDER: 'Householder',
	S78: 'Planning',
	ENFORCEMENT_NOTICE: 'Enforcement notice',
	ENFORCEMENT_LISTED_BUILDING: 'Enforcement listed building and conservation area',
	DISCONTINUANCE_NOTICE: 'Discontinuance notice',
	ADVERTISEMENT: 'Advertisement',
	COMMUNITY_INFRASTRUCTURE_LEVY: 'Community infrastructure levy',
	PLANNING_OBLIGATION: 'Planning obligation',
	AFFORDABLE_HOUSING_OBLIGATION: 'Affordable housing obligation',
	CALL_IN_APPLICATION: 'Call-in application',
	LAWFUL_DEVELOPMENT_CERTIFICATE: 'Lawful development certificate',
	PLANNED_LISTED_BUILDING: 'Planning listed building and conservation area',
	CAS_PLANNING: 'Commercial planning (CAS)',
	CAS_ADVERTISEMENT: 'Commercial advertisement (CAS)'
});

/** @type {Object<string, string>} */
export const PROCEDURE_TYPE_MAP = Object.freeze({
	written: 'written representations',
	hearing: 'a hearing',
	inquiry: 'an inquiry'
});

export const PROCEDURE_TYPE_ID_MAP = Object.freeze({
	hearing: 1,
	inquiry: 2,
	written: 3
});

export const APPEAL_REPRESENTATION_TYPE = Object.freeze({
	LPA_STATEMENT: 'lpa_statement',
	APPELLANT_STATEMENT: 'appellant_statement',
	RULE_6_PARTY_STATEMENT: 'rule_6_party_statement',
	COMMENT: 'comment',
	LPA_FINAL_COMMENT: 'lpa_final_comment',
	APPELLANT_FINAL_COMMENT: 'appellant_final_comment',
	LPA_PROOFS_EVIDENCE: 'lpa_proofs_evidence',
	APPELLANT_PROOFS_EVIDENCE: 'appellant_proofs_evidence',
	RULE_6_PARTY_PROOFS_EVIDENCE: 'rule_6_party_proofs_evidence'
});

export const APPEAL_PROOF_OF_EVIDENCE_STATUS = Object.freeze({
	AWAITING: 'awaiting',
	RECEIVED: 'received',
	VALID: 'valid',
	INVALID: 'invalid'
});

export const APPEAL_REPRESENTATION_STATUS = Object.freeze({
	AWAITING_REVIEW: 'awaiting_review',
	VALID: 'valid',
	INVALID: 'invalid',
	PUBLISHED: 'published',
	WITHDRAWN: 'withdrawn',
	INCOMPLETE: 'incomplete'
});

export const COMMENT_STATUS = Object.freeze({
	AWAITING_REVIEW: 'awaiting_review',
	VALID: 'valid',
	INVALID: 'invalid',
	VALID_REQUIRES_REDACTION: 'valid_requires_redaction',
	INCOMPLETE: 'incomplete'
});

export const TEAM_NAME_MAP = Object.freeze({
	MAJOR_CASEWORK: 'Major Casework Officer'
});

export const REVERT_BUTTON_TEXT = Object.freeze({
	LPA_STATEMENT: 'Revert to original LPA statement',
	APPELLANT_STATEMENT: 'Revert to original appellant statement',
	LPA_FINAL_COMMENT: 'Revert to original LPA final comments',
	APPELLANT_FINAL_COMMENT: 'Revert to original appellant final comments',
	DEFAULT_TEXT: 'Revert to original comment'
});

export const FEEDBACK_FORM_LINKS = Object.freeze({
	ALL: 'https://forms.office.com/Pages/ResponsePage.aspx?id=mN94WIhvq0iTIpmM5VcIjYt1ax_BPvtOqhVjfvzyJN5UOUlNRkhaQjNXTDQyNEhSRExNOFVGSkNJTS4u',

	S78: 'https://forms.office.com/Pages/ResponsePage.aspx?id=mN94WIhvq0iTIpmM5VcIjYt1ax_BPvtOqhVjfvzyJN5UQzg1SlNPQjA3V0FDNUFJTldHMlEzMDdMRS4u',

	HAS: 'https://forms.office.com/Pages/ResponsePage.aspx?id=mN94WIhvq0iTIpmM5VcIjYt1ax_BPvtOqhVjfvzyJN5UQ0wyTE9UVDIyWlVaQlBBTEM0TFYyU01YVC4u',

	S20: 'https://forms.office.com/Pages/ResponsePage.aspx?id=mN94WIhvq0iTIpmM5VcIjYt1ax_BPvtOqhVjfvzyJN5UQjI0R09ONVRVNVJZVk9XMzBYTFo2RDlQUy4u',

	CAS_PLANNING:
		'https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=mN94WIhvq0iTIpmM5VcIjYt1ax_BPvtOqhVjfvzyJN5URE1RMzFNSVQzUjBWRlQ2VFFPUTI3TkVSVC4u',

	CAS_ADVERTS:
		'https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=mN94WIhvq0iTIpmM5VcIjYt1ax_BPvtOqhVjfvzyJN5UOVZRWTJSOUdWUDk3T0owQTVFNExTUzlVSC4u',

	FULL_ADVERTS:
		'https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=mN94WIhvq0iTIpmM5VcIjYt1ax_BPvtOqhVjfvzyJN5UREdSMUZXUFhUMUdBUERBUFFGVkRQVEFBTS4u',

	LPA: 'https://forms.office.com.mcas.ms/Pages/ResponsePage.aspx?id=mN94WIhvq0iTIpmM5VcIjYt1ax_BPvtOqhVjfvzyJN5UNzVFTElMSEJIWlhXWkZFM1E1WDg3RTFPUy4u'
});

export const REPRESENTATION_ADDED_AS_DOCUMENT = 'Added as a document';
