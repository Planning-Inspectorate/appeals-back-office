import {
	createDateInputDateBusinessDayValidator,
	createDateInputDateValidityValidator,
	createDateInputFieldsValidator,
	extractAndProcessDateErrors
} from '#lib/validators/date-input.validator.js';
import { createValidator } from '@pins/express';
import { APPEAL_CASE_PROCEDURE } from '@planning-inspectorate/data-model';
import { body } from 'express-validator';
import { getIdText, getTimetableTypeText } from '../timetable/timetable.mapper.js';

export const validateAppealProcedure = createValidator(
	body('appealProcedure')
		.exists()
		.withMessage('Select the appeal procedure')
		.bail()
		.isIn(Object.values(APPEAL_CASE_PROCEDURE))
		.withMessage('Select the appeal procedure')
);

/**
 * @type {import('express').RequestHandler}
 */
export const validateStartCaseTimetable = (req, res, next) => {
	/** @type {import('../timetable/timetable.mapper.js').AppealTimetableType[]} */
	const timetableTypes = [
		'lpaQuestionnaireDueDate',
		'lpaStatementDueDate',
		'ipCommentsDueDate',
		'finalCommentsDueDate',
		'statementOfCommonGroundDueDate',
		'planningObligationDueDate',
		'proofOfEvidenceAndWitnessesDueDate',
		'caseManagementConferenceDueDate'
	];

	/** @type {import('express').RequestHandler[]} */
	const validatorsList = [];

	timetableTypes.forEach((timetableType) => {
		const idText = getIdText(timetableType);
		const fieldName = `${idText}-due-date`;
		const label = `${getTimetableTypeText(timetableType)} due date`;

		const hasDateInput = [
			req.body[`${fieldName}-day`],
			req.body[`${fieldName}-month`],
			req.body[`${fieldName}-year`]
		].some((value) => value && value.trim());

		if (hasDateInput) {
			validatorsList.push(
				createDateInputFieldsValidator(fieldName, label),
				createDateInputDateValidityValidator(fieldName, label),
				createDateInputDateBusinessDayValidator(fieldName, label)
			);
		}
	});

	validatorsList.push(
		...timetableTypes.map((timetableType) =>
			extractAndProcessDateErrors({
				fieldNamePrefix: `${getIdText(timetableType)}-due-date`
			})
		)
	);

	let index = 0;
	// @ts-ignore
	const runNext = (err) => {
		if (err) return next(err);
		const validator = validatorsList[index++];
		if (!validator) return next();
		validator(req, res, runNext);
	};
	runNext();
	return;
};
