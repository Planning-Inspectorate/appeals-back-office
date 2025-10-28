import validateDateParameter from '#common/validators/date-parameter.js';
import validateIdParameter from '#common/validators/id-parameter.js';
import validateRegex from '#common/validators/regex-parameter.js';
import {
	validateRequiredStringParameter,
	validateStringParameter,
	validateStringParameterAllowingEmpty
} from '#common/validators/string-parameter.js';
import { validationErrorHandler } from '#middleware/error-handler.js';
import {
	ERROR_INVALID_POSTCODE,
	ERROR_MUST_BE_NUMBER,
	LENGTH_250,
	LENGTH_8,
	UK_POSTCODE_REGEX
} from '@pins/appeals/constants/support.js';
import { composeMiddleware } from '@pins/express';
import { body } from 'express-validator';

export const postChangeProcedureTypeValidator = composeMiddleware(
	validateIdParameter('appealId'),

	body('appealProcedure')
		.notEmpty()
		.withMessage('appealProcedure is required')
		.isIn(['hearing', 'inquiry', 'written'])
		.withMessage('appealProcedure must be one of hearing, inquiry, or written'),

	body('existingAppealProcedure')
		.notEmpty()
		.withMessage('existingAppealProcedure is required')
		.isIn(['hearing', 'inquiry', 'written'])
		.withMessage('existingAppealProcedure must be one of hearing, inquiry, or written'),

	body('eventDate')
		.if((_, { req }) => req.body.appealProcedure === 'inquiry')
		.notEmpty()
		.withMessage('eventDate is required')
		.bail()
		.isISO8601()
		.withMessage('eventDate must be a valid date'),

	// hearing/written → optional, but if present must be a valid date
	body('eventDate')
		.if((_, { req }) => ['hearing', 'written'].includes(req.body.appealProcedure))
		.optional({ checkFalsy: true })
		.isISO8601()
		.withMessage('eventDate must be a valid date'),

	body('estimationDays')
		.optional({ checkFalsy: true })
		.isInt({ min: 1 })
		.withMessage('estimationDays must be a positive integer'),

	validateDateParameter({ parameterName: 'lpaQuestionnaireDueDate', isRequired: true }),
	validateDateParameter({ parameterName: 'lpaStatementDueDate', isRequired: true }),
	validateDateParameter({ parameterName: 'ipCommentsDueDate', isRequired: true }),

	body('planningObligationDueDate')
		.optional({ checkFalsy: true })
		.custom(() =>
			validateDateParameter({
				parameterName: 'planningObligationDueDate',
				isRequired: false
			})
		)
		.withMessage('planningObligationDueDate must be a valid date'),

	body('finalCommentsDueDate')
		.optional({ checkFalsy: true })
		.custom((value, { req }) => {
			if (req.body.appealProcedure === 'written') {
				validateDateParameter({ parameterName: 'finalCommentsDueDate', isRequired: true });
			}
			return true;
		}),
	body('statementOfCommonGroundDueDate')
		.optional({ checkFalsy: true })
		.custom((value, { req }) => {
			if (['inquiry', 'hearing'].includes(req.body.appealProcedure)) {
				validateDateParameter({
					parameterName: 'statementOfCommonGroundDueDate',
					isRequired: true
				});
			}
			return true;
		}),
	body('proofOfEvidenceAndWitnessesDueDate')
		.optional({ checkFalsy: true })
		.custom((value, { req }) => {
			if (req.body.appealProcedure === 'inquiry') {
				validateDateParameter({
					parameterName: 'proofOfEvidenceAndWitnessesDueDate',
					isRequired: true
				});
			}
			return true;
		}),

	body('address')
		.optional()
		.custom((value) => {
			if (typeof value !== 'object') throw new Error('address must be an object');
			const { addressLine1, town, postcode } = value;
			if (!addressLine1 || !town || !postcode) {
				throw new Error('address must include addressLine1, town, and postcode');
			}
			return true;
		}),

	body('address').optional(),
	body('estimatedDays').optional().isNumeric().withMessage(ERROR_MUST_BE_NUMBER),
	validateRequiredStringParameter('address.addressLine1', LENGTH_250, 'address'),
	validateStringParameterAllowingEmpty('address.addressLine2', LENGTH_250),
	validateRequiredStringParameter('address.town', LENGTH_250, 'address'),
	validateStringParameter('address.country', LENGTH_250),
	validateStringParameterAllowingEmpty('address.county', LENGTH_250),
	validateRequiredStringParameter('address.postcode', LENGTH_8, 'address'),
	validateRegex('address.postcode', UK_POSTCODE_REGEX, 'address').withMessage(
		ERROR_INVALID_POSTCODE
	),
	validationErrorHandler
);
