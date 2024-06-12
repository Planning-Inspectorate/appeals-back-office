/** @type {Object<string, string>} */
export const STATUSES = {
	ASSIGN_CASE_OFFICER: 'assign_case_officer',
	VALIDATION: 'validation',
	READY_TO_START: 'ready_to_start',
	LPA_QUESTIONNAIRE: 'lpa_questionnaire',
	STATEMENT_REVIEW: 'statement_review',
	FINAL_COMMENT_REVIEW: 'final_comment_review',
	ISSUE_DETERMINATION: 'issue_determination',
	COMPLETE: 'complete',
	INVALID: 'invalid',
	WITHDRAWN: 'withdrawn',
	CLOSED: 'closed',
	AWAITING_TRANSFER: 'awaiting_transfer',
	TRANSFERRED: 'transferred'
};

/** @type {Object<string, string>} */
export const TRANSITIONS = {
	ASSIGNED_CASE_OFFICER: 'assigned_case_officer',
	VALIDATION_VALID: 'validation_valid',
	VALIDATION_INVALID: 'validation_invalid',
	START: 'start',
	LPAQ_COMPLETE: 'questionnaire_complete',
	WITHDRAWING: 'withdrawing',
	CLOSING: 'closing',
	AWAITING_TRANSFER: 'awaiting_transfer',
	COMPLETING_TRANSFER: 'completing_transfer'
};

export const FINAL_STATE = 'final';
