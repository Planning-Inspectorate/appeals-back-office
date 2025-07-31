import { currentStatus } from '#utils/current-status.js';
import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';

/**
 *
 * @param {*} appeal
 * @param {*[]}linkedAppeals
 * @returns {boolean}
 */
export const isAwaitingLinkedAppeal = (appeal, linkedAppeals) => {
	switch (currentStatus(appeal)) {
		case APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE: {
			const validationOutcome =
				appeal.lpaQuestionnaire?.lpaQuestionnaireValidationOutcome?.name?.toLowerCase();
			if (validationOutcome !== 'complete') {
				return false;
			}
			return !allLpaQuestionnaireOutcomesAreComplete(linkedAppeals);
		}
		default: {
			return false;
		}
	}
};

/**
 *
 * @param {*[]} linkedAppeals
 * @returns {*|boolean}
 */
export const allLpaQuestionnaireOutcomesAreComplete = (linkedAppeals) => {
	if (!linkedAppeals.length) {
		return true;
	}
	// @ts-ignore
	return linkedAppeals.every((appeal) => {
		const validationOutcome =
			appeal.lpaQuestionnaire?.lpaQuestionnaireValidationOutcome?.name?.toLowerCase();
		return validationOutcome === 'complete';
	});
};
