import { composeMiddleware } from '@pins/express';
import { body } from 'express-validator';
import { validationErrorHandler } from '#middleware/error-handler.js';
import {
	ERROR_MUST_BE_STRING,
	ERROR_CANNOT_BE_EMPTY_STRING,
	ERROR_MAX_LENGTH_CHARACTERS
} from '#endpoints/constants.js';

import stringTokenReplacement from '#utils/string-token-replacement.js';

const getInvalidDecisionReasonValidator = composeMiddleware(
	body('invalidDecisionReason')
		.isString()
		.withMessage(ERROR_MUST_BE_STRING)
		.notEmpty()
		.withMessage(ERROR_CANNOT_BE_EMPTY_STRING)
		.isLength({ max: 1000 })
		.withMessage(stringTokenReplacement(ERROR_MAX_LENGTH_CHARACTERS, [1000])),
	validationErrorHandler
);

export { getInvalidDecisionReasonValidator };
