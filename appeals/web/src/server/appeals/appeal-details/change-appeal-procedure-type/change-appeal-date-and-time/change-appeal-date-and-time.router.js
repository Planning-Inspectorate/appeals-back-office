import { dateFieledName } from '#appeals/appeal-details/inquiry/setup/inquiry.constants.js';
import * as validators from '#appeals/appeal-details/inquiry/setup/set-up-inquiry-validators.js';
import { saveBodyToSession } from '#lib/middleware/save-body-to-session.js';
import { extractAndProcessDateErrors } from '#lib/validators/date-input.validator.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controller from './change-appeal-date-and-time.controller.js';

const router = createRouter({ mergeParams: true });

router
	.route('/')
	.get(asyncHandler(controller.getChangeProcedureInquiryDate))
	.post(
		validators.validateInquiryDateTime,
		extractAndProcessDateErrors({
			fieldNamePrefix: dateFieledName
		}),
		saveBodyToSession('changeProcedureType'),
		asyncHandler(controller.postChangeProcedureInquiryDate)
	);

export default router;
