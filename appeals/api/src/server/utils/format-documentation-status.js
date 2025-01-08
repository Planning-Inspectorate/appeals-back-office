import { APPEAL_REPRESENTATION_STATUS } from '@pins/appeals/constants/common.js';
import { DOCUMENT_STATUS_NOT_RECEIVED, DOCUMENT_STATUS_RECEIVED } from '#endpoints/constants.js';

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Schema.Representation} Representation */

/**
 * @param {Appeal} appeal
 * @returns {string}
 */
export const formatAppellantCaseDocumentationStatus = (appeal) => {
	if (appeal.appellantCase && appeal.appellantCase.appellantCaseValidationOutcome?.name) {
		return appeal.appellantCase.appellantCaseValidationOutcome.name;
	}

	return appeal.appellantCase ? DOCUMENT_STATUS_RECEIVED : DOCUMENT_STATUS_NOT_RECEIVED;
};

/**
 * @param {Appeal} appeal
 * @returns {string}
 */
export const formatLpaQuestionnaireDocumentationStatus = (appeal) => {
	if (appeal.lpaQuestionnaire && appeal.lpaQuestionnaire.lpaQuestionnaireValidationOutcome?.name) {
		return appeal.lpaQuestionnaire.lpaQuestionnaireValidationOutcome.name;
	}
	return appeal.lpaQuestionnaire ? DOCUMENT_STATUS_RECEIVED : DOCUMENT_STATUS_NOT_RECEIVED;
};

/**
 * @param {Representation | null} lpaStatement
 * @returns {string}
 * */
export function formatLpaStatementStatus(lpaStatement) {
	if (!lpaStatement) {
		return DOCUMENT_STATUS_NOT_RECEIVED;
	}

	if (lpaStatement.status === APPEAL_REPRESENTATION_STATUS.AWAITING_REVIEW) {
		return DOCUMENT_STATUS_RECEIVED;
	}

	return lpaStatement.status;
}
