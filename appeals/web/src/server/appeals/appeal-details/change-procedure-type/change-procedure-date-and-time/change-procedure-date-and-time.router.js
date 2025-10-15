import { saveBodyToSession } from '#lib/middleware/save-body-to-session.js';
import { extractAndProcessDateErrors } from '#lib/validators/date-input.validator.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import { dateFieledName } from './change-procedure-date-and-time.constants.js';
import * as controller from './change-procedure-date-and-time.controller.js';
import * as validators from './change-procedure-date-and-time.validator.js';

const router = createRouter({ mergeParams: true });

router
	.route('/')
	.get(asyncHandler(controller.getChangeProcedureEventDate))
	.post(
		validators.validateEventDateTime(),
		extractAndProcessDateErrors({
			fieldNamePrefix: dateFieledName
		}),
		saveBodyToSession('changeProcedureType'),
		asyncHandler(controller.postChangeProcedureEventDate)
	);

export default router;
