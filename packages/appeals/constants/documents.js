/** @type {Object<string, string>} */
export const REDACTION_STATUS = {
	REDACTED: 'redacted',
	UNREDACTED: 'not_redacted',
	NO_REDACTION_REQUIRED: 'no_redaction_required'
};

/** @type {Object<string, string>} */
export const AVSCAN_STATUS = {
	NOT_SCANNED: 'not_scanned',
	SCANNED: 'scanned',
	AFFECTED: 'affected'
};

/** @type {Object<string, string>} */
export const ORIGIN = {
	CITIZEN: 'citizen',
	LPA: 'lpa',
	PINS: 'pins',
	OGD: 'ogd'
};

/** @type {Object<string, string>} */
export const STAGE = {
	APPELLANT_CASE: 'appellant-case',
	LPA_QUESTIONNAIRE: 'lpa-questionnaire',
	APPEAL_DECISION: 'appeal-decision',
	COSTS: 'costs',
	INTERNAL: 'internal',
	STATEMENTS: 'statements',
	THIRD_PARTY_COMMENTS: 'third-party-comments',
	FINAL_COMMENTS: 'final-comments'
};

/** @type {Object<string, string>} */
export const DOCTYPE = {
	APPELLANT_CASE_CORRESPONDENCE: 'appellantCaseCorrespondence',
	APPELLANT_CASE_WITHDRAWAL: 'appellantCaseWithdrawalLetter',
	APPELLANT_COST_APPLICATION: 'appellantCostsApplication',
	APPELLANT_COST_CORRESPONDENCE: 'appellantCostsCorrespondence',
	APPELLANT_COST_WITHDRAWAL: 'appellantCostsWithdrawal',
	APPELLANT_STATEMENT: 'appellantStatement',
	APPLICATION_DECISION: 'applicationDecisionLetter',
	CHANGED_DESCRIPTION: 'changedDescription',
	ORIGINAL_APPLICATION_FORM: 'originalApplicationForm',
	WHO_NOTIFIED: 'whoNotified',
	CONSERVATION_MAP: 'conservationMap',
	LPA_CASE_CORRESPONDENCE: 'lpaCaseCorrespondence',
	LPA_COST_APPLICATION: 'lpaCostsApplication',
	LPA_COST_CORRESPONDENCE: 'lpaCostsCorrespondence',
	LPA_COST_WITHDRAWAL: 'lpaCostsWithdrawal',
	OTHER_PARTY_REPS: 'otherPartyRepresentations',
	PLANNING_OFFICER_REPORT: 'planningOfficerReport',
	COST_DECISION_LETTER: 'costsDecisionLetter',
	CASE_DECISION_LETTER: 'caseDecisionLetter',
	CROSS_TEAM_CORRESPONDENCE: 'crossTeamCorrespondence',
	INSPECTOR_CORRESPONDENCE: 'inspectorCorrespondence',
	DROPBOX: 'dropBox'
};

/** @type {string[]} */
export const FOLDERS = [
	`${STAGE.APPELLANT_CASE}/${DOCTYPE.APPELLANT_STATEMENT}`,
	`${STAGE.APPELLANT_CASE}/${DOCTYPE.ORIGINAL_APPLICATION_FORM}`,
	`${STAGE.APPELLANT_CASE}/${DOCTYPE.APPLICATION_DECISION}`,
	`${STAGE.APPELLANT_CASE}/${DOCTYPE.CHANGED_DESCRIPTION}`,
	`${STAGE.APPELLANT_CASE}/${DOCTYPE.APPELLANT_CASE_WITHDRAWAL}`,
	`${STAGE.APPELLANT_CASE}/${DOCTYPE.APPELLANT_CASE_CORRESPONDENCE}`,
	`${STAGE.LPA_QUESTIONNAIRE}/${DOCTYPE.WHO_NOTIFIED}`,
	`${STAGE.LPA_QUESTIONNAIRE}/${DOCTYPE.CONSERVATION_MAP}`,
	`${STAGE.LPA_QUESTIONNAIRE}/${DOCTYPE.OTHER_PARTY_REPS}`,
	`${STAGE.LPA_QUESTIONNAIRE}/${DOCTYPE.PLANNING_OFFICER_REPORT}`,
	`${STAGE.LPA_QUESTIONNAIRE}/${DOCTYPE.LPA_CASE_CORRESPONDENCE}`,
	`${STAGE.COSTS}/appellant`,
	`${STAGE.COSTS}/lpa`,
	`${STAGE.COSTS}/decision`,
	// `${STAGE.COSTS}/${DOCTYPE.APPELLANT_COST_APPLICATION}`,
	// `${STAGE.COSTS}/${DOCTYPE.APPELLANT_COST_WITHDRAWAL}`,
	// `${STAGE.COSTS}/${DOCTYPE.APPELLANT_COST_CORRESPONDENCE}`,
	// `${STAGE.COSTS}/${DOCTYPE.LPA_COST_APPLICATION}`,
	// `${STAGE.COSTS}/${DOCTYPE.LPA_COST_WITHDRAWAL}`,
	// `${STAGE.COSTS}/${DOCTYPE.LPA_COST_CORRESPONDENCE}`,
	// `${STAGE.COSTS}/${DOCTYPE.COST_DECISION_LETTER}`,
	`${STAGE.INTERNAL}/${DOCTYPE.CROSS_TEAM_CORRESPONDENCE}`,
	`${STAGE.INTERNAL}/${DOCTYPE.INSPECTOR_CORRESPONDENCE}`,
	`${STAGE.INTERNAL}/${DOCTYPE.DROPBOX}`,
	`${STAGE.APPEAL_DECISION}/${DOCTYPE.CASE_DECISION_LETTER}`
];
