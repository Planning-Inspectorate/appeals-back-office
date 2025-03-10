export const ODW_SYSTEM_ID = 'back-office-appeals';
export const APPEAL_START_RANGE = 6000000;

export const EVENT_TYPE = Object.freeze({
	SITE_VISIT: 'siteVisit'
});

export const FEATURE_FLAG_NAMES = Object.freeze({
	SECTION_78: 'featureFlagS78Written'
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
	PLANNED_LISTED_BUILDING: 'Planned listed building and conservation area appeal',
	COMMERCIAL: 'Commercial (CAS) appeal'
});

/** @type {Object<string, string>} */
export const PROCEDURE_TYPE_MAP = Object.freeze({
	written: 'a written procedure',
	hearing: 'a hearing',
	inquiry: 'an inquiry'
});

export const APPEAL_REPRESENTATION_TYPE = Object.freeze({
	LPA_STATEMENT: 'lpa_statement',
	APPELLANT_STATEMENT: 'appellant_statement',
	COMMENT: 'comment',
	LPA_FINAL_COMMENT: 'lpa_final_comment',
	APPELLANT_FINAL_COMMENT: 'appellant_final_comment'
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
