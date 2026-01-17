import {
	createDateInputDateBusinessDayValidator,
	createDateInputDateInFutureValidator,
	createDateInputDateValidityValidator,
	createDateInputFieldsValidator,
	extractAndProcessDateErrors
} from '#lib/validators/date-input.validator.js';
import { addAppellantCaseToLocals } from '../change-procedure-type.service.js';

/**
 * @param {string} fieldName
 * @param {string} label
 * @returns
 */
export const createDueDateValidators = (fieldName, label) => [
	createDateInputFieldsValidator(fieldName, label),
	createDateInputDateValidityValidator(fieldName, label),
	createDateInputDateInFutureValidator(fieldName, label),
	createDateInputDateBusinessDayValidator(fieldName, label)
];

/**
 * @type {import('express').RequestHandler}
 */
export const runDueDateDaysValidator = async (req, res, next) => {
	if (req.errored) {
		next();
		return;
	}
	const appellantCase = await addAppellantCaseToLocals(req);
	const validators = dueDateDaysInputValidator(appellantCase.planningObligation.hasObligation);
	let index = 0;
	// @ts-ignore
	const runNext = (err) => {
		if (err) return next(err);
		const validator = validators[index++];
		if (!validator) return next();
		validator(req, res, runNext);
	};
	runNext();
};

/**
 * @param {Boolean} hasPlanningObligation
 * @returns {import('express').RequestHandler[]}
 */
export const dueDateDaysInputValidator = (hasPlanningObligation) => {
	/** @type {import('express').RequestHandler[]} */
	const validatorsList = [];

	const validatorsMap = {
		lpaQuestionnaireDueDate: {
			id: 'lpa-questionnaire-due-date',
			label: 'LPA questionnaire due date'
		},
		statementDueDate: {
			id: 'statement-due-date',
			label: 'Statement due date'
		},
		ipCommentsDueDate: {
			id: 'ip-comments-due-date',
			label: 'Interested party comments due date'
		},
		proofsOfEvidenceDueDate: {
			id: 'proof-of-evidence-and-witnesses-due-date',
			label: 'Proof of evidence and witnesses due date'
		},
		caseManagementConferenceDueDate: {
			id: 'case-management-conference-due-date',
			label: 'Case management conference due date'
		},
		statementOfCommonGroundDueDate: {
			id: 'statement-of-common-ground-due-date',
			label: 'Statement of common ground due date'
		},
		...(hasPlanningObligation && {
			planningObligationDueDate: {
				id: 'planning-obligation-due-date',
				label: 'Planning obligation due date'
			}
		})
	};

	Object.values(validatorsMap).forEach((validatorType) => {
		validatorsList.push(...createDueDateValidators(validatorType.id, validatorType.label));
	});

	validatorsList.push(
		extractAndProcessDateErrors({
			fieldNamePrefix: 'lpa-questionnaire-due-date'
		}),
		extractAndProcessDateErrors({
			fieldNamePrefix: 'statement-due-date'
		}),
		extractAndProcessDateErrors({
			fieldNamePrefix: 'ip-comments-due-date'
		}),
		extractAndProcessDateErrors({
			fieldNamePrefix: 'proof-of-evidence-and-witnesses-due-date'
		}),
		extractAndProcessDateErrors({
			fieldNamePrefix: 'statement-of-common-ground-due-date'
		}),
		...(hasPlanningObligation
			? [
					extractAndProcessDateErrors({
						fieldNamePrefix: 'planning-obligation-due-date'
					})
				]
			: [])
	);

	return validatorsList;
};
