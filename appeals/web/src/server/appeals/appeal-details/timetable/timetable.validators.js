import {
	createDateInputFieldsValidator,
	createDateInputDateValidityValidator,
	createDateInputDateInFutureValidator,
	createDateInputDateBusinessDayValidator,
	extractAndProcessDateErrors,
	createDateInputDateInFutureOfDateValidator
} from '#lib/validators/date-input.validator.js';
import { getAppealTimetableTypes } from './timetable.mapper.js';

/**
 *
 * @param {string} fieldName
 * @param {string} label
 * @param {string} fieldNameToCompare
 * @param {string} labelToCompare
 * @returns
 */
export const createTimetableValidators = (fieldName, label, fieldNameToCompare, labelToCompare) => [
	createDateInputFieldsValidator(fieldName, label),
	createDateInputDateValidityValidator(fieldName, label),
	createDateInputDateInFutureValidator(fieldName, label),
	createDateInputDateBusinessDayValidator(fieldName, label),
	createDateInputDateInFutureOfDateValidator(fieldName, label, fieldNameToCompare, labelToCompare)
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
			label: 'Statements due date',
			idToCompare: 'lpa-questionnaire-due-date',
			labelToCompare: 'LPA questionnaire due date'
		},
		ipCommentsDueDate: {
			id: 'ip-comments-due-date',
			label: 'Interested party comments due date',
			idToCompare: 'lpa-questionnaire-due-date',
			labelToCompare: 'LPA questionnaire due date'
		},
		finalCommentsDueDate: {
			id: 'final-comments-due-date',
			label: 'Final comments due date',
			idToCompare: 'lpa-statement-due-date',
			labelToCompare: 'statements due date'
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
		const validatorConfig = validatorsMap[timetableType];
		const idToCompare = 'idToCompare' in validatorConfig ? validatorConfig.idToCompare : '';
		const labelToCompare =
			'labelToCompare' in validatorConfig ? validatorConfig.labelToCompare : '';
		validatorsList.push(
			...createTimetableValidators(
				validatorConfig.id,
				validatorConfig.label,
				idToCompare,
				labelToCompare
			)
		);
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
