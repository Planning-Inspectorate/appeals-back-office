export const ODW_SYSTEM_ID = 'back-office-appeals';
export const ODW_APPELLANT_SVCUSR = 'Appellant';
export const ODW_AGENT_SVCUSR = 'Agent';
export const APPEAL_START_RANGE = 6000000;

export const EVENT_TYPE = {
	SITE_VISIT: 'siteVisit'
};

export const FEATURE_FLAG_NAMES = {
	SECTION_78: 'featureFlagS78Written'
};

export const APPEAL_TYPE = {
	D: 'Householder',
	W: 'Planning appeal',
	C: 'Enforcement notice appeal',
	F: 'Enforcement listed building and conservation area appeal',
	G: 'Discontinuance notice appeal',
	H: 'Advertisement appeal',
	L: 'Community infrastructure levy',
	Q: 'Planning obligation appeal',
	S: 'Affordable housing obligation appeal',
	V: 'Call-in application',
	X: 'Lawful development certificate appeal',
	Y: 'Planned listed building and conservation area appeal',
	Z: 'Commercial (CAS) appeal'
};

//TODO: remove when available in appeal-representation.schema
export const APPEAL_REPRESENTATION_TYPE = {
	STATEMENT: 'statement',
	COMMENT: 'comment',
	FINAL_COMMENT: 'final_comment'
};

//TODO: remove when available in appeal-representation.schema - here just for reference
// eslint-disable-next-line no-unused-vars
export const APPEAL_REPRESENTATION_STATUS = {
	AWAITING_REVIEW: 'awaiting_review',
	VALID: 'valid',
	INVALID: 'invalid',
	PUBLISHED: 'published',
	WITHDRAWN: 'withdrawn'
};
