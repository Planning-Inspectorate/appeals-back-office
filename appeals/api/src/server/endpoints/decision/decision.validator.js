import { validationErrorHandler } from '#middleware/error-handler.js';
import {
	DECISION_TYPE_APPELLANT_COSTS,
	DECISION_TYPE_INSPECTOR,
	DECISION_TYPE_LPA_COSTS,
	ERROR_CASE_OUTCOME_MUST_BE_ONE_OF,
	ERROR_MUST_BE_STRING,
	ERROR_MUST_BE_UUID,
	ERROR_MUST_CONTAIN_AT_LEAST_1_VALUE
} from '@pins/appeals/constants/support.js';
import { composeMiddleware } from '@pins/express';
import { body } from 'express-validator';

import validateDateParameter from '#common/validators/date-parameter.js';
import { validateOptionalTextAreaParameter } from '#common/validators/string-parameter.js';
import { APPEAL_CASE_DECISION_OUTCOME } from '@planning-inspectorate/data-model';

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
		.isIn([...Object.values(APPEAL_CASE_DECISION_OUTCOME), null])
		.withMessage(ERROR_CASE_OUTCOME_MUST_BE_ONE_OF),
	validationErrorHandler
);

const getDateValidator = composeMiddleware(
	validateDateParameter({
		parameterName: 'decisions.*.documentDate',
		mustBeNotBeFutureDate: true
	})
);

const getDocumentValidator = composeMiddleware(
	body('decisions.*.documentGuid').optional().isUUID().withMessage(ERROR_MUST_BE_UUID),
	validationErrorHandler
);

const getInvalidDecisionReasonValidator = composeMiddleware(
	validateOptionalTextAreaParameter('decisions.*.invalidDecisionReason', 1000),
	validationErrorHandler
);

export {
	getDateValidator,
	getDecisionsValidator,
	getDecisionTypeValidator,
	getDocumentValidator,
	getInvalidDecisionReasonValidator,
	getOutcomeValidator
};
