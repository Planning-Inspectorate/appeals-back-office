import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controllers from './environmental-impact-assessment.controller.js';

const router = createRouter({ mergeParams: true });

router
	.route('/column-two-threshold/change')
	.get(asyncHandler(controllers.getChangeEiaColumnTwoThreshold))
	.post(asyncHandler(controllers.postChangeEiaColumnTwoThreshold));

router
	.route('/requires-environmental-statement/change')
	.get(asyncHandler(controllers.getChangeEiaRequiresEnvironmentalStatement))
	.post(asyncHandler(controllers.postChangeEiaRequiresEnvironmentalStatement));

router
	.route('/sensitive-area-details/change')
	.get(asyncHandler(controllers.getChangeEiaSensitiveAreaDetails))
	.post(asyncHandler(controllers.postChangeEiaSensitiveAreaDetails));

router
	.route('/consulted-bodies-details/change')
	.get(asyncHandler(controllers.getChangeEiaConsultedBodiesDetails))
	.post(asyncHandler(controllers.postChangeEiaConsultedBodiesDetails));

export default router;
