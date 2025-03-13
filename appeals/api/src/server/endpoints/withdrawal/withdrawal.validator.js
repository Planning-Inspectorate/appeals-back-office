import { composeMiddleware } from '@pins/express';
import { body } from 'express-validator';
import { validationErrorHandler } from '#middleware/error-handler.js';
import { ERROR_MUST_BE_UUID } from '@pins/appeals/constants/support.js';

import validateDateParameter from '#common/validators/date-parameter.js';

const getDocumentValidator = composeMiddleware(
	body('documentGuid').isUUID().withMessage(ERROR_MUST_BE_UUID),
	validationErrorHandler
);

const getDateValidator = composeMiddleware(
	validateDateParameter({
		parameterName: 'withdrawalRequestDate',
		mustBeNotBeFutureDate: true
	}),
	validationErrorHandler
);

export { getDateValidator, getDocumentValidator };
