import { saveBodyToSession } from '#lib/middleware/save-body-to-session.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controllers from './change-procedure-event-date-known.controller.js';
import * as validators from './change-procedure-event-date-known.validators.js';

const router = createRouter({ mergeParams: true });

router
	.route('/')
	.get(asyncHandler(controllers.getEventDateKnown))
	.post(
		validators.validateDateKnown,
		saveBodyToSession('changeProcedureType'),
		asyncHandler(controllers.postEventDateKnown)
	);

export default router;
