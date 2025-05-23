import { composeMiddleware } from '@pins/express';
import { body } from 'express-validator';
import { validationErrorHandler } from '#middleware/error-handler.js';
import {
	CASE_OUTCOME_ALLOWED,
	CASE_OUTCOME_DISMISSED,
	CASE_OUTCOME_SPLIT_DECISION,
	ERROR_MUST_BE_STRING,
	ERROR_CASE_OUTCOME_MUST_BE_ONE_OF,
	ERROR_MUST_BE_UUID,
	DECISION_TYPE_INSPECTOR,
	DECISION_TYPE_APPELLANT_COSTS,
	DECISION_TYPE_LPA_COSTS,
	ERROR_MUST_CONTAIN_AT_LEAST_1_VALUE
} from '@pins/appeals/constants/support.js';

import validateDateParameter from '#common/validators/date-parameter.js';

const getDecisionsValidator = composeMiddleware(
	body('decisions').isArray().withMessage(ERROR_MUST_CONTAIN_AT_LEAST_1_VALUE),
	validationErrorHandler
);

const getDecisionTypeValidator = composeMiddleware(
	body('decisions.*.decisionType').isString().withMessage(ERROR_MUST_BE_STRING),
	body('decisions.*.decisionType')
		.isIn([DECISION_TYPE_INSPECTOR, DECISION_TYPE_APPELLANT_COSTS, DECISION_TYPE_LPA_COSTS])
		.withMessage(ERROR_CASE_OUTCOME_MUST_BE_ONE_OF),
	validationErrorHandler
);

const getOutcomeValidator = composeMiddleware(
	body('decisions.*.outcome')
		.isIn([CASE_OUTCOME_ALLOWED, CASE_OUTCOME_DISMISSED, CASE_OUTCOME_SPLIT_DECISION, null])
		.withMessage(ERROR_CASE_OUTCOME_MUST_BE_ONE_OF),
	validationErrorHandler
);

const getDateValidator = composeMiddleware(
	validateDateParameter({
		parameterName: 'decisions.*.documentDate',
		mustBeNotBeFutureDate: true,
		mustBeBusinessDay: true
	})
);

const getDocumentValidator = composeMiddleware(
	body('decisions.*.documentGuid').isUUID().withMessage(ERROR_MUST_BE_UUID),
	validationErrorHandler
);

export {
	getDecisionsValidator,
	getDecisionTypeValidator,
	getOutcomeValidator,
	getDateValidator,
	getDocumentValidator
};
