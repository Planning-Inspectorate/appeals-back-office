import { Router as createRouter } from 'express';
import * as controller from './outcome-invalid.controller.js';
import * as validators from './outcome-invalid.validators.js';
import { validateAppeal } from '../../appeal-details.middleware.js';

const router = createRouter({ mergeParams: true });

router
	.route('/')
	.get(validateAppeal, controller.getInvalidReason)
	.post(
		validateAppeal,
		validators.validateInvalidReason,
		validators.validateInvalidReasonTextItems,
		controller.postInvalidReason
	);

router.route('/confirmation').get(validateAppeal, controller.getConfirmation);

export default router;
