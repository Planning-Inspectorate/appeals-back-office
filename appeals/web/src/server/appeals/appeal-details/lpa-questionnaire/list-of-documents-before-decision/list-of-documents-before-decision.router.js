import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controllers from './list-of-documents-before-decision.controller.js';
import { validateListDocumentsBeforeDecision } from './list-of-documents-before-decision.validators.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(asyncHandler(controllers.getChangeListDocumentsBeforeDecision))
	.post(
		validateListDocumentsBeforeDecision,
		asyncHandler(controllers.postChangeListDocumentsBeforeDecision)
	);

export default router;
