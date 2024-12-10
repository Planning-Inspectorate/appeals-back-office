import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controllers from './environmental-impact-assessment.controller.js';
import * as validators from './environmental-impact-assessment.validators.js';

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
	.post(
		validators.validateSensitiveAreaDetailsTextArea,
		asyncHandler(controllers.postChangeEiaSensitiveAreaDetails)
	);

router
	.route('/consulted-bodies-details/change')
	.get(asyncHandler(controllers.getChangeEiaConsultedBodiesDetails))
	.post(
		validators.validateConsultedBodiesDetailsTextArea,
		asyncHandler(controllers.postChangeEiaConsultedBodiesDetails)
	);

export default router;
