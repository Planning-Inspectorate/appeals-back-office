import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controllers from './agricultural-holding.controller.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(asyncHandler(controllers.getChangePartOfAgriculturalHolding))
	.post(asyncHandler(controllers.postChangePartOfAgriculturalHolding));

router
	.route('/tenant/change')
	.get(asyncHandler(controllers.getChangeTenantOfAgriculturalHolding))
	.post(asyncHandler(controllers.postChangeTenantOfAgriculturalHolding));

router
	.route('/other-tenants/change')
	.get(asyncHandler(controllers.getChangeOtherTenantsOfAgriculturalHolding))
	.post(asyncHandler(controllers.postChangeOtherTenantsOfAgriculturalHolding));

export default router;
