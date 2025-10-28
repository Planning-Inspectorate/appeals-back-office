import { saveBodyToSession } from '#lib/middleware/save-body-to-session.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controller from './change-procedure-address-details.controller.js';
import * as validators from './change-procedure-address-details.validator.js';

const router = createRouter({ mergeParams: true });

router
	.route('/')
	.get(asyncHandler(controller.getAddressDetails))
	.post(
		validators.validateAddress,
		saveBodyToSession('changeProcedureType', { scopeToAppeal: true }),
		asyncHandler(controller.postAddressDetails)
	);

export default router;
