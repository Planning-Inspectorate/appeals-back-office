import { addAppellantCaseToLocals } from '#appeals/appeal-details/timetable/timetable.middleware.js';
import { saveBodyToSession } from '#lib/middleware/save-body-to-session.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controllers from './change-procedure-timetable.controller.js';
import { runTimetableValidators } from './change-procedure-timetable.middleware.js';

const router = createRouter({ mergeParams: true });

router
	.route('/')
	.get(addAppellantCaseToLocals, asyncHandler(controllers.getChangeAppealTimetable))
	.post(
		addAppellantCaseToLocals,
		runTimetableValidators,
		saveBodyToSession('changeProcedureType', { scopeToAppeal: true }),
		asyncHandler(controllers.postChangeAppealTimetable)
	);

export default router;
