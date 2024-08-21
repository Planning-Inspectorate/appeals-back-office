import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import * as controllers from './ownership-certificate.controller.js';
import { validateAppeal } from '../../appeal-details.middleware.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(validateAppeal, asyncHandler(controllers.getChangeOwnershipCertificate))
	.post(validateAppeal, asyncHandler(controllers.postChangeOwnershipCertificate));

export default router;
