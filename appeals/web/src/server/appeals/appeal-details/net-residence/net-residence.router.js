import { Router as createRouter } from 'express';
import * as controller from './net-residence.controller.js';
import { asyncHandler } from '@pins/express';
import * as validators from './net-residence.validators.js';

const router = createRouter({ mergeParams: true });

router
	.route('/new')
	.get(asyncHandler(controller.getNetResidence))
	.post(
		validators.validateNetResidenceSelected,
		validators.validateNetGainOrLoss(
			'net gain',
			'net-gain',
			// @ts-ignore
			(value, { req }) => {
				return req.body['net-residence'] === 'gain';
			}
		),
		validators.validateNetGainOrLoss(
			'net loss',
			'net-loss',
			// @ts-ignore
			(value, { req }) => {
				return req.body['net-residence'] === 'loss';
			}
		),
		asyncHandler(controller.postNetResidence)
	);

export default router;
