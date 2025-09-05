import { validationErrorHandler } from '#middleware/error-handler.js';
import {
	CASE_OUTCOME_ALLOWED,
	CASE_OUTCOME_DISMISSED,
	CASE_OUTCOME_SPLIT_DECISION,
	ERROR_CASE_OUTCOME_MUST_BE_ONE_OF,
	ERROR_MUST_BE_STRING,
	ERROR_MUST_BE_UUID
} from '@pins/appeals/constants/support.js';
import { composeMiddleware } from '@pins/express';
import { body } from 'express-validator';

import validateDateParameter from '#common/validators/date-parameter.js';

const getOutcomeValidator = composeMiddleware(
	body('outcome').isString().withMessage(ERROR_MUST_BE_STRING),
	body('outcome')
		.isIn([CASE_OUTCOME_ALLOWED, CASE_OUTCOME_DISMISSED, CASE_OUTCOME_SPLIT_DECISION])
		.withMessage(ERROR_CASE_OUTCOME_MUST_BE_ONE_OF),
	validationErrorHandler
);

const getDateValidator = composeMiddleware(
	validateDateParameter({
		parameterName: 'documentDate',
		mustBeNotBeFutureDate: true,
		mustBeBusinessDay: true
	})
);

const getDocumentValidator = composeMiddleware(
	body('documentGuid').isUUID().withMessage(ERROR_MUST_BE_UUID),
	validationErrorHandler
);

export { getDateValidator, getDocumentValidator, getOutcomeValidator };
