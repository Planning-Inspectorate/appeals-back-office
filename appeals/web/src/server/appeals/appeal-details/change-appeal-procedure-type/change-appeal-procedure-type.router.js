import { Router as createRouter } from 'express';
import * as controller from './change-appeal-procedure-type.controller.js';
import changeTimetableRouter from './change-appeal-timetable/change-appeal-timetable.router.js';
import changeProcedureSelectionRouter from './change-procedure-selection/change-procedure-selection.router.js';
import checkAndConfirmRouter from './check-and-confirm/check-and-confirm.router.js';

const router = createRouter({ mergeParams: true });

router.use(
	'/change-selected-procedure-type',
	controller.updateChangeProcedureTypeSession,
	changeProcedureSelectionRouter
);

router.use('/change-timetable', controller.updateChangeProcedureTypeSession, changeTimetableRouter);

router.use(
	'/check-and-confirm',
	controller.updateChangeProcedureTypeSession,
	checkAndConfirmRouter
);

export default router;
