import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controllers from './relates-to-agricultural-purpose.controller.js';
import { validateRelatesToAgriculturalPurpose } from './relates-to-agricultural-purpose.validator.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(asyncHandler(controllers.getRelatesToAgriculturalPurpose))
	.post(
		validateRelatesToAgriculturalPurpose,
		asyncHandler(controllers.postRelatesToAgriculturalPurpose)
	);

export default router;
