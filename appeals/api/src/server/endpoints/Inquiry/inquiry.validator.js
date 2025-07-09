import validateDateParameter from '#common/validators/date-parameter.js';
import validateIdParameter from '#common/validators/id-parameter.js';
import validateRegex from '#common/validators/regex-parameter.js';
import {
	validateRequiredStringParameter,
	validateStringParameter,
	validateStringParameterAllowingEmpty
} from '#common/validators/string-parameter.js';
import { validationErrorHandler } from '#middleware/error-handler.js';
import { dateIsAfterDate } from '#utils/date-comparison.js';
import { ERROR_MUST_BE_IN_FUTURE } from '@pins/appeals/constants/support.js';
import {
	ERROR_INVALID_POSTCODE,
	ERROR_MUST_BE_NUMBER,
	LENGTH_250,
	LENGTH_8,
	UK_POSTCODE_REGEX
} from '@pins/appeals/constants/support.js';
import { composeMiddleware } from '@pins/express';
import { body, check } from 'express-validator';

export const getInquiryValidator = composeMiddleware(
	validateIdParameter('appealId'),
	validateIdParameter('inquiryId'),
	validationErrorHandler
);

export const postInquiryValidator = composeMiddleware(
	validateIdParameter('appealId'),
	validateDateParameter({ parameterName: 'startDate', isRequired: true }),
	validateDateParameter({ parameterName: 'inquiryStartTime', isRequired: true }),
	validateDateParameter({ parameterName: 'inquiryEndTime' }),
	validateDateParameter({ parameterName: 'lpaQuestionnaireDueDate', isRequired: true }),
	validateDateParameter({ parameterName: 'statementDueDate', isRequired: true }),
	validateDateParameter({ parameterName: 'ipCommentsDueDate', isRequired: true }),
	validateDateParameter({ parameterName: 'statementOfCommonGroundDueDate', isRequired: true }),
	validateDateParameter({ parameterName: 'proofOfEvidenceAndWitnessesDueDate', isRequired: true }),
	validateDateParameter({ parameterName: 'planningObligationDueDate', isRequired: true }),
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

export const patchInquiryValidator = composeMiddleware(
	validateIdParameter('appealId'),
	validateIdParameter('inquiryId'),
	validateDateParameter({ parameterName: 'inquiryStartTime', isRequired: true }),
	validateDateParameter({ parameterName: 'inquiryEndTime' }),
	body('addressId').optional().isNumeric().withMessage(ERROR_MUST_BE_NUMBER),
	body('address').optional({ values: 'null' }),
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

export const deleteInquiryParamsValidator = composeMiddleware(
	validateIdParameter('appealId'),
	validateIdParameter('inquiryId'),
	validationErrorHandler
);

export const deleteInquiryDateValidator = composeMiddleware(
	check('inquiryStartTime').custom(async (_value, { req }) => {
		const { inquiryStartTime } = req.appeal.inquiry;
		if (!dateIsAfterDate(inquiryStartTime, new Date())) {
			throw new Error(ERROR_MUST_BE_IN_FUTURE);
		}
	}),
	validationErrorHandler
);
