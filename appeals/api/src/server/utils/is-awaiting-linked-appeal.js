import { currentStatus } from '#utils/current-status.js';
import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';
import { isArray } from 'lodash-es';

/**
 *
 * @param {*} appeal
 * @param {*[]}linkedAppeals
 * @returns {boolean}
 */
export const isAwaitingLinkedAppeal = (appeal, linkedAppeals) => {
	if (!allLinkedAppealsHaveSameAppealStatus(appeal, linkedAppeals)) {
		return true;
	}
	switch (currentStatus(appeal)) {
		case APPEAL_CASE_STATUS.VALIDATION: {
			const validationOutcome =
				appeal.appellantCase?.appellantCaseValidationOutcome?.name?.toLowerCase();
			if (validationOutcome !== 'valid') {
				return false;
			}
			return !allAppellantCaseOutcomesAreValid(linkedAppeals);
		}
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
 * @param {number|undefined} [currentAppealId]
 * @param {*} [validationOutcome]
 * @returns {*|boolean}
 */
export const allLpaQuestionnaireOutcomesAreComplete = (
	linkedAppeals,
	currentAppealId,
	validationOutcome
) => {
	if (!linkedAppeals.length) {
		return true;
	}
	// @ts-ignore
	return linkedAppeals.every((linkedAppeal) => {
		// Make sure the linked appeal is the actual appeal and not a wrapper
		const appeal = linkedAppeal.appeal || linkedAppeal;
		if (currentAppealId && appeal.id === currentAppealId) {
			// Make sure the current linked appeal tests the latest validation outcome
			if (!appeal.lpaQuestionnaire) {
				appeal.lpaQuestionnaire = {};
			}
			appeal.lpaQuestionnaire.lpaQuestionnaireValidationOutcome = validationOutcome;
		}
		return (
			appeal.lpaQuestionnaire?.lpaQuestionnaireValidationOutcome?.name?.toLowerCase() === 'complete'
		);
	});
};

/**
 *
 * @param {*[]} linkedAppeals
 * @param {number|undefined} [currentAppealId]
 * @param {*} [validationOutcome]
 * @returns {*|boolean}
 */
export const allAppellantCaseOutcomesAreValid = (
	linkedAppeals,
	currentAppealId,
	validationOutcome
) => {
	if (!linkedAppeals.length) {
		return true;
	}
	// @ts-ignore
	return linkedAppeals.every((linkedAppeal) => {
		// Make sure the linked appeal is the actual appeal and not a wrapper
		const appeal = linkedAppeal.appeal || linkedAppeal;
		if (currentAppealId && appeal.id === currentAppealId) {
			// Make sure the current linked appeal tests the latest validation outcome
			if (!appeal.appellantCase) {
				appeal.appellantCase = {};
			}
			appeal.appellantCase.appellantCaseValidationOutcome = validationOutcome;
		}
		return appeal.appellantCase?.appellantCaseValidationOutcome?.name?.toLowerCase() === 'valid';
	});
};

/**
 *
 * @param {*} appeal
 * @param {*[]}linkedAppeals
 * @returns {*|boolean}
 */
const allLinkedAppealsHaveSameAppealStatus = (appeal, linkedAppeals) => {
	if (!linkedAppeals.length) {
		return true;
	}

	const appealStatus = currentStatus(appeal);

	return linkedAppeals.every((linkedAppeal) => {
		// If the linked appeal is an appeal wrapper
		if (linkedAppeal.appeal) {
			//@ts-ignore
			return includesStatus(linkedAppeal.appeal, appealStatus);
		}
		if (linkedAppeal.child && linkedAppeal.parent) {
			return (
				//@ts-ignore
				includesStatus(linkedAppeal.child, appealStatus) &&
				//@ts-ignore
				includesStatus(linkedAppeal.parent, appealStatus)
			);
		}
		if (isArray(linkedAppeal.appealStatus)) {
			return includesStatus(linkedAppeal, appealStatus);
		}
		return (
			appealStatus === linkedAppeal.currentStatus ||
			linkedAppeal.completedStateList?.includes(appealStatus)
		);
	});
};

/**
 *
 * @param {*} appeal
 * @param {string} status
 * @returns {boolean}
 */
function includesStatus(appeal, status) {
	// @ts-ignore
	return appeal.appealStatus?.some((item) => item.status === status);
}
