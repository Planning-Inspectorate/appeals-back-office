import { saveBodyToSession } from '#lib/middleware/save-body-to-session.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controller from './hearing.controller.js';
import * as validators from './hearing.validators.js';

const router = createRouter({ mergeParams: true });

router
	.route('/')
	.get(asyncHandler(controller.getHearingDateKnown))
	.post(
		validators.validateDateKnown,
		saveBodyToSession('startCaseHearing'),
		asyncHandler(controller.postHearingDateKnown)
	);

export default router;
