/**
 * @typedef {'appealDetails'|'appellantCase'|'lpaQuestionnaire'|'manageDocuments'|'manageFolder'|'manageRelatedAppeals'|'manageNeighbouringSites'|'ipComments'|'viewIpComment'|'reviewIpComment'|'lpaStatement'|'viewFinalComments'|'appealDecision'|'viewProofOfEvidence'|'sharedIpComments'| 'appellantStatement'|'rule6PartyStatement'} ServicePageName
 */

import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';

export const paginationDefaultSettings = {
	pageSize: 30,
	firstPageNumber: 1
};

export const textInputCharacterLimits = {
	defaultAddressInputLength: 250,
	defaultInputLength: 300,
	caseNoteTextInputLength: 500,
	checkboxTextItemsLength: 1000,
	defaultTextareaLength: 1000,
	expandedTextareaLength: 8000
};

export const APPEAL_CASE_PRE_STATEMENTS_STATUS = [
	APPEAL_CASE_STATUS.ASSIGN_CASE_OFFICER,
	APPEAL_CASE_STATUS.VALIDATION,
	APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE,
	APPEAL_CASE_STATUS.STATEMENTS,
	APPEAL_CASE_STATUS.READY_TO_START
];

export const kilobyte = 1000;
export const megabyte = 1000000;
export const gigabyte = 1000000000;
