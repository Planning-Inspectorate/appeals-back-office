import { APPEAL_REPRESENTATION_STATUS } from '@pins/appeals/constants/common.js';
import {
	DOCUMENT_STATUS_NOT_RECEIVED,
	DOCUMENT_STATUS_RECEIVED
} from '@pins/appeals/constants/support.js';

/** @typedef {import('#db-client/models.ts').AppellantCaseValidationOutcomeModel } AppellantCaseValidationOutcomeModel */
/** @typedef {import('#db-client/models.ts').LPAQuestionnaireValidationOutcomeModel } LPAQuestionnaireValidationOutcomeModel */
/** @typedef {import('#db-client/models.ts').RepresentationModel } RepresentationModel */

/**
 * @param {{ appellantCase?: { appellantCaseValidationOutcome?: { name: AppellantCaseValidationOutcomeModel['name'] } | null } | null }} appeal
 * @returns {string}
 */
export const formatAppellantCaseDocumentationStatus = (appeal) => {
	if (appeal.appellantCase?.appellantCaseValidationOutcome?.name) {
		return appeal.appellantCase.appellantCaseValidationOutcome.name;
	}

	return appeal.appellantCase ? DOCUMENT_STATUS_RECEIVED : DOCUMENT_STATUS_NOT_RECEIVED;
};

/**
 * @param {{ lpaQuestionnaire?: { lpaQuestionnaireValidationOutcome?: { name: LPAQuestionnaireValidationOutcomeModel['name'] } | null } | null }} appeal
 * @returns {string}
 */
export const formatLpaQuestionnaireDocumentationStatus = (appeal) => {
	if (appeal.lpaQuestionnaire?.lpaQuestionnaireValidationOutcome?.name) {
		return appeal.lpaQuestionnaire.lpaQuestionnaireValidationOutcome.name;
	}
	return appeal.lpaQuestionnaire ? DOCUMENT_STATUS_RECEIVED : DOCUMENT_STATUS_NOT_RECEIVED;
};

/**
 *
 * @param {{ status?: RepresentationModel['status'] }} representation
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
