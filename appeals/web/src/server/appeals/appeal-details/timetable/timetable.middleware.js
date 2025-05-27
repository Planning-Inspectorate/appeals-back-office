import { APPEAL_CASE_STATUS } from 'pins-data-model';
import { createTimetableValidators } from './timetable.validators.js';

/**
 * @type {import("express").RequestHandler}
 * @returns {import('express').RequestHandler<any>[]}
 */
export const selectTimetableValidators = (req) => {
	const { appealType, appealStatus } = req.currentAppeal || {};
	const validatorsList = [];

	if (appealType === 'Householder') {
		validatorsList.push(
			...createTimetableValidators('lpa-questionnaire-due-date', 'LPA questionnaire due date')
		);
	} else if (appealType === 'Planning appeal') {
		if (appealStatus === APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE) {
			validatorsList.push(
				...createTimetableValidators('lpa-questionnaire-due-date', 'LPA questionnaire due date')
			);
		}

		if (
			appealStatus === APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE ||
			appealStatus === APPEAL_CASE_STATUS.STATEMENTS
		) {
			validatorsList.push(
				...createTimetableValidators('lpa-statement-due-date', 'Statements due date'),
				...createTimetableValidators('ip-comments-due-date', 'Interested party comments due date')
			);
		}

		validatorsList.push(
			...createTimetableValidators('final-comments-due-date', 'Final comments due date')
		);
	}
	return validatorsList;
};
