import {
	createDateInputFieldsValidator,
	createDateInputDateValidityValidator,
	createDateInputDateInFutureValidator,
	createDateInputDateBusinessDayValidator,
	extractAndProcessDateErrors
} from '#lib/validators/date-input.validator.js';
import { getAppealTimetableTypes } from './timetable.mapper.js';

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
	/** @type {import('express').RequestHandler[]} */
	const validatorsList = [];
	const { appellantCase } = req.locals;
	const timetableTypes = getAppealTimetableTypes(currentAppeal, appellantCase);

	const validatorsMap = {
		lpaQuestionnaireDueDate: {
			id: 'lpa-questionnaire-due-date',
			label: 'LPA questionnaire due date'
		},
		lpaStatementDueDate: {
			id: 'lpa-statement-due-date',
			label: 'Statements due date'
		},
		ipCommentsDueDate: {
			id: 'ip-comments-due-date',
			label: 'Interested party comments due date'
		},
		finalCommentsDueDate: {
			id: 'final-comments-due-date',
			label: 'Final comments due date'
		},
		statementOfCommonGroundDueDate: {
			id: 'statement-of-common-ground-due-date',
			label: 'Statement of common ground due date'
		},
		planningObligationDueDate: {
			id: 'planning-obligation-due-date',
			label: 'Planning obligation due date'
		}
	};

	timetableTypes.forEach((timetableType) => {
		const { id, label } = validatorsMap[timetableType];
		validatorsList.push(...createTimetableValidators(id, label));
	});
	validatorsList.push(
		extractAndProcessDateErrors({
			fieldNamePrefix: 'lpa-questionnaire-due-date'
		}),
		extractAndProcessDateErrors({
			fieldNamePrefix: 'lpa-statement-due-date'
		}),
		extractAndProcessDateErrors({
			fieldNamePrefix: 'ip-comments-due-date'
		}),
		extractAndProcessDateErrors({
			fieldNamePrefix: 'final-comments-due-date'
		})
	);
	return validatorsList;
};
