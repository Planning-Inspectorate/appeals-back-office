import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import * as controllers from './agricultural-holding.controller.js';
import { validateAppeal } from '../../appeal-details.middleware.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(validateAppeal, asyncHandler(controllers.getChangePartOfAgriculturalHolding))
	.post(validateAppeal, asyncHandler(controllers.postChangePartOfAgriculturalHolding));

router
	.route('/tenant/change')
	.get(validateAppeal, asyncHandler(controllers.getChangeTenantOfAgriculturalHolding))
	.post(validateAppeal, asyncHandler(controllers.postChangeTenantOfAgriculturalHolding));

router
	.route('/other-tenants/change')
	.get(validateAppeal, asyncHandler(controllers.getChangeOtherTenantsOfAgriculturalHolding))
	.post(validateAppeal, asyncHandler(controllers.postChangeOtherTenantsOfAgriculturalHolding));

export default router;
