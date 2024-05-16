export const REDACTION_STATUS = {
	REDACTED: 'redacted',
	UNREDACTED: 'not_redacted',
	NO_REDACTION_REQUIRED: 'no_redaction_required'
};

export const AVSCAN_STATUS = {
	NOT_SCANNED: 'not_scanned',
	SCANNED: 'scanned',
	AFFECTED: 'affected'
};

export const ORIGIN = {
	CITIZEN: 'citizen',
	LPA: 'lpa',
	PINS: 'pins',
	OGD: 'ogd'
};

export const STAGE = {
	APPELLANTCASE: 'appellant-case',
	LPAQUESTIONNAIRE: 'lpa-questionnaire',
	APPEALDECISION: 'appeal-decision',
	COSTS: 'costs',
	STATEMENTS: 'statements',
	THIRDPARTYCOMMENTS: 'third-party-comments',
	FINALCOMMENTS: 'final-comments'
};
