export const ODW_SYSTEM_ID = 'back-office-appeals';
export const APPEAL_START_RANGE = 6000000;

export const EVENT_TYPE = Object.freeze({
	SITE_VISIT: 'siteVisit',
	HEARING: 'hearing'
});

export const FEATURE_FLAG_NAMES = Object.freeze({
	SECTION_78: 'featureFlagS78Written',
	SECTION_78_HEARING: 'featureFlagS78Hearing',
	SECTION_78_INQUIRY: 'featureFlagS78Inquiry',
	SECTION_20: 'featureFlagS20',
	CAS: 'featureFlagCAS',
	CAS_ADVERT: 'featureFlagCasAdvert',
	LINKED_APPEALS: 'featureFlagLinkedAppeals',
	CHANGE_PROCEDURE_TYPE: 'featureFlagChangeProcedureType',
	ADVERTISEMENT: 'featureFlagAdvertisement',
	CHANGE_APPEAL_TYPE: 'featureFlagChangeAppealType'
});

export const APPEAL_TYPE = Object.freeze({
	HOUSEHOLDER: 'Householder',
	S78: 'Planning appeal',
	ENFORCEMENT_NOTICE: 'Enforcement notice appeal',
	ENFORCEMENT_LISTED_BUILDING: 'Enforcement listed building and conservation area appeal',
	DISCONTINUANCE_NOTICE: 'Discontinuance notice appeal',
	ADVERTISEMENT: 'Advertisement appeal',
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
	COMMENT: 'comment',
	LPA_FINAL_COMMENT: 'lpa_final_comment',
	APPELLANT_FINAL_COMMENT: 'appellant_final_comment',
	LPA_PROOFS_EVIDENCE: 'lpa_proofs_evidence',
	APPELLANT_PROOFS_EVIDENCE: 'appellant_proofs_evidence'
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

export const REVERT_BUTTON_TEXT = Object.freeze({
	LPA_STATEMENT: 'Revert to original LPA statement',
	LPA_FINAL_COMMENT: 'Revert to original LPA final comments',
	APPELLANT_FINAL_COMMENT: 'Revert to original appellant final comments',
	DEFAULT_TEXT: 'Revert to original comment'
});
