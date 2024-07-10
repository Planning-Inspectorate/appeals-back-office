import { composeMiddleware } from '@pins/express';
import { body } from 'express-validator';
import { validationErrorHandler } from '#middleware/error-handler.js';
import {
	ERROR_MUST_BE_CORRECT_DATE_FORMAT,
	ERROR_MUST_BE_IN_PAST,
	ERROR_MUST_BE_UUID
} from '#endpoints/constants.js';

import { dateIsAfterDate } from '#utils/date-comparison.js';

const getDocumentValidator = composeMiddleware(
	body('documentGuid').isUUID().withMessage(ERROR_MUST_BE_UUID),
	validationErrorHandler
);

const getDateValidator = composeMiddleware(
	body('withdrawalRequestDate').isDate().withMessage(ERROR_MUST_BE_CORRECT_DATE_FORMAT),
	body('withdrawalRequestDate')
		.custom((value) => dateIsAfterDate(new Date(), new Date(value)))
		.withMessage(ERROR_MUST_BE_IN_PAST),
	validationErrorHandler
);

export { getDateValidator, getDocumentValidator };
