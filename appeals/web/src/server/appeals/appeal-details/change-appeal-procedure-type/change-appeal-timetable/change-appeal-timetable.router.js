import { Router as createRouter } from 'express';
import * as controllers from './change-appeal-timetable.controller.js';
import { asyncHandler } from '@pins/express';
import { saveBodyToSession } from '#lib/middleware/save-body-to-session.js';
import {
	addAppellantCaseToLocals,
	runTimetableValidators
} from '#appeals/appeal-details/timetable/timetable.middleware.js';
import { validateAppeal } from '#appeals/appeal-details/appeal-details.middleware.js';

const router = createRouter({ mergeParams: true });

router
	.route('/')
	.get(validateAppeal, addAppellantCaseToLocals, asyncHandler(controllers.getChangeAppealTimetable))
	.post(
		validateAppeal,
		addAppellantCaseToLocals,
		runTimetableValidators,
		saveBodyToSession('changeProcedureType'),
		asyncHandler(controllers.postChangeAppealTimetable)
	);

export default router;
