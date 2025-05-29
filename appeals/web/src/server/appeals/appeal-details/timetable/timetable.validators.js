import {
	createDateInputFieldsValidator,
	createDateInputDateValidityValidator,
	createDateInputDateInFutureValidator,
	createDateInputDateBusinessDayValidator
} from '#lib/validators/date-input.validator.js';
import { APPEAL_CASE_STATUS } from 'pins-data-model';

/**
 *
 * @param {string} fieldName
 * @param {string} label
 * @returns
 */
export const createTimetableValidators = (fieldName, label) => [
	createDateInputFieldsValidator(fieldName, label),
	createDateInputDateValidityValidator(fieldName, label),
	createDateInputDateInFutureValidator(fieldName, label),
	createDateInputDateBusinessDayValidator(fieldName, label)
];

/**
 * @param {import('express').Request} req
 * @returns {import('express').RequestHandler[]}
 */
export const selectTimetableValidators = (req) => {
	const { currentAppeal } = req || {};
	const validatorsList = [];

	if (currentAppeal.appealType === 'Householder') {
		validatorsList.push(
			...createTimetableValidators('lpa-questionnaire-due-date', 'LPA questionnaire due date')
		);
	} else if (currentAppeal.appealType === 'Planning appeal') {
		if (
			currentAppeal.appealStatus === APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE &&
			currentAppeal.documentationSummary?.lpaQuestionnaire?.status !== 'received'
		) {
			validatorsList.push(
				...createTimetableValidators('lpa-questionnaire-due-date', 'LPA questionnaire due date')
			);
		}

		if (
			currentAppeal.appealStatus === APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE ||
			currentAppeal.appealStatus === APPEAL_CASE_STATUS.STATEMENTS
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
