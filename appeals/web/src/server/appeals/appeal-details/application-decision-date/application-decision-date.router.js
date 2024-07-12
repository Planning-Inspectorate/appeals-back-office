import { Router as createRouter } from 'express';
import * as controllers from './application-decision-date.controller.js';
import { asyncHandler } from '@pins/express';
import * as validators from './application-decision-date.validators.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(asyncHandler(controllers.getChangeApplicationHasDecisionDate))
	.post(asyncHandler(controllers.postChangeApplicationHasDecisionDate));

router
	.route('/change/set-date')
	.get(controllers.getChangeApplicationSetDecisionDate)
	.post(
		validators.validateDateFields,
		validators.validateDateValid,
		validators.validatePastDate,
		controllers.postChangeApplicationSetDecisionDate
	);

export default router;
