import { APPEAL_REPRESENTATION_STATUS } from '@pins/appeals/constants/common.js';
import {
	DOCUMENT_STATUS_NOT_RECEIVED,
	DOCUMENT_STATUS_RECEIVED
} from '@pins/appeals/constants/support.js';

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('#repositories/appeal-lists.repository.js').DBAppeals} DBAppeals */
/** @typedef {DBAppeals[0]} DBAppeal */
/** @typedef {import('@pins/appeals.api').Schema.Representation} Representation */
/** @typedef {import('#repositories/appeal-lists.repository.js').DBUserAppeal} DBUserAppeal */

/**
 * @param {Appeal | DBAppeal | DBUserAppeal} appeal
 * @returns {string}
 */
export const formatAppellantCaseDocumentationStatus = (appeal) => {
	if (appeal.appellantCase && appeal.appellantCase.appellantCaseValidationOutcome?.name) {
		return appeal.appellantCase.appellantCaseValidationOutcome.name;
	}

	return appeal.appellantCase ? DOCUMENT_STATUS_RECEIVED : DOCUMENT_STATUS_NOT_RECEIVED;
};

/**
 * @param {Appeal | DBAppeal | DBUserAppeal} appeal
 * @returns {string}
 */
export const formatLpaQuestionnaireDocumentationStatus = (appeal) => {
	if (appeal.lpaQuestionnaire && appeal.lpaQuestionnaire.lpaQuestionnaireValidationOutcome?.name) {
		return appeal.lpaQuestionnaire.lpaQuestionnaireValidationOutcome.name;
	}
	return appeal.lpaQuestionnaire ? DOCUMENT_STATUS_RECEIVED : DOCUMENT_STATUS_NOT_RECEIVED;
};

/**
 *
 * @param {Representation} representation
 * @returns {string}
 * */
export function formatRepresentationStatus(representation) {
	if (!representation) {
		return DOCUMENT_STATUS_NOT_RECEIVED;
	}

	if (representation.status === APPEAL_REPRESENTATION_STATUS.AWAITING_REVIEW) {
		return DOCUMENT_STATUS_RECEIVED;
	}

	return representation.status || DOCUMENT_STATUS_NOT_RECEIVED;
}
