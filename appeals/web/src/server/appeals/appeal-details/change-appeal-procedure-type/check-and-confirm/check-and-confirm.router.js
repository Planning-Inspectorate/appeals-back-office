import { Router as createRouter } from 'express';
import * as controllers from './check-and-confirm.controller.js';
import { asyncHandler } from '@pins/express';
import { addAppellantCaseToLocals } from '#appeals/appeal-details/timetable/timetable.middleware.js';

const router = createRouter({ mergeParams: true });

router.route('/').get(addAppellantCaseToLocals, asyncHandler(controllers.getCheckAndConfirm));

export default router;
