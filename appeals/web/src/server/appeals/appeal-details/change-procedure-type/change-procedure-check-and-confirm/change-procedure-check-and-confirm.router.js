import { addAppellantCaseToLocals } from '#appeals/appeal-details/timetable/timetable.middleware.js';
import { saveBodyToSession } from '#lib/middleware/save-body-to-session.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controllers from './change-procedure-check-and-confirm.controller.js';

const router = createRouter({ mergeParams: true });

router
	.route('/')
	.get(
		addAppellantCaseToLocals,
		saveBodyToSession('changeProcedureType'),
		asyncHandler(controllers.getCheckAndConfirm)
	);

export default router;
