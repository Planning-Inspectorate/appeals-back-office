import { currentStatus } from '#utils/current-status.js';
import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';

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
	return linkedAppeals.every((linkedAppeal) => {
		// Make sure the linked appeal is the actual appeal and not a wrapper
		const appeal = linkedAppeal.appeal || linkedAppeal;
		const validationOutcome =
			appeal.lpaQuestionnaire?.lpaQuestionnaireValidationOutcome?.name?.toLowerCase();
		return validationOutcome === 'complete';
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
			return linkedAppeal.appeal.appealStatus.find((item) => item.status === appealStatus);
		}
		if (linkedAppeal.child && linkedAppeal.parent) {
			return (
				//@ts-ignore
				linkedAppeal.child.appealStatus.find((item) => item.status === appealStatus) &&
				//@ts-ignore
				linkedAppeal.parent.appealStatus.find((item) => item.status === appealStatus)
			);
		}
		return (
			appealStatus === linkedAppeal.currentStatus ||
			linkedAppeal.completedStateList.includes(appealStatus)
		);
	});
};
