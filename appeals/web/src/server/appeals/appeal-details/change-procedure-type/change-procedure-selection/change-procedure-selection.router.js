import { saveBackUrl } from '#lib/middleware/save-back-url.js';
import { saveBodyToSession } from '#lib/middleware/save-body-to-session.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controllers from './change-procedure-selection.controller.js';
import * as validators from './change-procedure-selection.validators.js';

const router = createRouter({ mergeParams: true });

router
	.route('/')
	.get(saveBackUrl('changeProcedureType'), asyncHandler(controllers.getSelectProcedure))
	.post(
		validators.validateSelectProcedure,
		saveBodyToSession('changeProcedureType', { scopeToAppeal: true }),
		asyncHandler(controllers.postChangeSelectProcedure)
	);

export default router;
