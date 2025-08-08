import { Router as createRouter } from 'express';
import * as controller from './invalid-appeal.controller.js';
import * as validators from './invalid-appeal.validators.js';

const router = createRouter({ mergeParams: true });

router
	.route(['/', '/new'])
	.get(controller.getInvalidReason)
	.post(
		validators.validateInvalidReason,
		validators.validateInvalidReasonTextItems,
		controller.postInvalidReason
	);

router.route('/confirmation').get(controller.getConfirmation);

export default router;
