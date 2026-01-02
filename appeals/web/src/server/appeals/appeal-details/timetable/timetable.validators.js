import {
	createDateInputDateBusinessDayValidator,
	createDateInputDateInFutureOfDateValidator,
	createDateInputDateInFutureValidator,
	createDateInputDateValidityValidator,
	createDateInputFieldsValidator,
	extractAndProcessDateErrors
} from '#lib/validators/date-input.validator.js';
import { getIdText } from './timetable.mapper.js';

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
 * @param {import('./timetable.mapper.js').AppealTimetableType[]} timetableTypes
 * @param {any} session
 * @returns {import('express').RequestHandler[]}
 */
export const selectTimetableValidators = (req, timetableTypes, session) => {
	const { currentAppeal } = req || {};
	/** @type {import('express').RequestHandler[]} */
	const validatorsList = [];

	const originalTimetable = currentAppeal.appealTimetable || {};
	session.appealTimetable = session.appealTimetable || {};

	timetableTypes.forEach((timetableType) => {
		const idText = getIdText(timetableType);
		const sessionDate = buildSessionDate(req, idText);
		const originalDatePart = (originalTimetable[timetableType] || '').slice(0, 10);

		if (!originalDatePart || sessionDate !== originalDatePart) {
			//only validate due dates that have changed
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
		}
		session.appealTimetable[timetableType] = sessionDate;
	});
	validatorsList.push(...getAllDateErrorExtractors());
	return validatorsList;
};

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
	},
	proofOfEvidenceAndWitnessesDueDate: {
		id: 'proof-of-evidence-and-witnesses-due-date',
		label: 'Proof of evidence and witnesses due date',
		idToCompare: 'ip-comments-due-date',
		labelToCompare: 'Interested party comments due date'
	},
	caseManagementConferenceDueDate: {
		id: 'case-management-conference-due-date',
		label: 'Case management conference due date'
	}
};

/**
 * Builds a session date string from request body fields.
 * @param {import('express').Request} req
 * @param {string} idText
 * @returns {string}
 */
export const buildSessionDate = (req, idText) => {
	const updatedDueDateDay = parseInt(req.body[`${idText}-due-date-day`], 10);
	const updatedDueDateMonth = parseInt(req.body[`${idText}-due-date-month`], 10);
	const updatedDueDateYear = parseInt(req.body[`${idText}-due-date-year`], 10);

	const updatedDueDateDayString = `0${updatedDueDateDay}`.slice(-2);
	const updatedDueDateMonthString = `0${updatedDueDateMonth}`.slice(-2);

	if (!isValidDayMonthYear(updatedDueDateDay, updatedDueDateMonth, updatedDueDateYear)) {
		return '';
	}

	return `${updatedDueDateYear}-${updatedDueDateMonthString}-${updatedDueDateDayString}`;
};

/**
 * Extracts and processes date errors for all timetable fields.
 * @returns {import('express').RequestHandler[]}
 */
const getAllDateErrorExtractors = () => [
	extractAndProcessDateErrors({ fieldNamePrefix: 'lpa-questionnaire-due-date' }),
	extractAndProcessDateErrors({ fieldNamePrefix: 'lpa-statement-due-date' }),
	extractAndProcessDateErrors({ fieldNamePrefix: 'ip-comments-due-date' }),
	extractAndProcessDateErrors({ fieldNamePrefix: 'final-comments-due-date' }),
	extractAndProcessDateErrors({ fieldNamePrefix: 'statement-of-common-ground-due-date' }),
	extractAndProcessDateErrors({ fieldNamePrefix: 'planning-obligation-due-date' }),
	extractAndProcessDateErrors({ fieldNamePrefix: 'proof-of-evidence-and-witnesses-due-date' }),
	extractAndProcessDateErrors({ fieldNamePrefix: 'case-management-conference-due-date' })
];

/**
 * Checks if the provided day, month, and year are valid calendar values.
 * @param {number} day
 * @param {number} month
 * @param {number} year
 * @returns {boolean}
 */
const isValidDayMonthYear = (day, month, year) => {
	return !!day && !!month && !!year && day >= 1 && day <= 31 && month >= 1 && month <= 12;
};
