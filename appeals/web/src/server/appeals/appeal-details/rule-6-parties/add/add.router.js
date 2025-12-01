import { saveBackUrl } from '#lib/middleware/save-back-url.js';
import { saveBodyToSession } from '#lib/middleware/save-body-to-session.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controller from './add.controller.js';
import * as validators from './add.validators.js';

const router = createRouter({ mergeParams: true });

router.get('/', controller.redirectAndClearSession('/name', 'addRule6Party'));

router
	.route('/name')
	.get(saveBackUrl('addRule6Party'), asyncHandler(controller.getName))
	.post(
		validators.validateName,
		saveBodyToSession('addRule6Party', { scopeToAppeal: true }),
		asyncHandler(controller.postName)
	);

router
	.route('/email')
	.get(asyncHandler(controller.getEmail))
	.post(
		validators.validateEmail,
		saveBodyToSession('addRule6Party', { scopeToAppeal: true }),
		asyncHandler(controller.postEmail)
	);

router
	.route('/check-details')
	.get(asyncHandler(controller.getCheckDetails))
	.post(saveBodyToSession('addRule6Party'), asyncHandler(controller.postCheckDetails));

export default router;
