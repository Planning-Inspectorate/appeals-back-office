import changeAddressKnownRouter from '#appeals/appeal-details/change-appeal-procedure-type/change-appeal-address-known/change-appeal-address-known.router.js';
import { Router as createRouter } from 'express';
import changeAddressDetailsRouter from './change-appeal-address-details/change-appeal-address-details.router.js';
import changeDateAndTimeRouter from './change-appeal-date-and-time/change-appeal-date-and-time.router.js';
import changeEstimationRouter from './change-appeal-estimation/change-appeal-estimation.router.js';
import * as controller from './change-appeal-procedure-type.controller.js';
import changeTimetableRouter from './change-appeal-timetable/change-appeal-timetable.router.js';
import changeEventKnownRouter from './change-event-date-known/change-event-date-known.router.js';
import changeProcedureSelectionRouter from './change-procedure-selection/change-procedure-selection.router.js';
import checkAndConfirmRouter from './check-and-confirm/check-and-confirm.router.js';

const router = createRouter({ mergeParams: true });

router.use(
	'/change-selected-procedure-type',
	controller.updateChangeProcedureTypeSession,
	changeProcedureSelectionRouter
);

router.use(
	'/:procedureType/change-event-date-known',
	controller.updateChangeProcedureTypeSession,
	changeEventKnownRouter
);

router.use(
	'/:procedureType/date',
	controller.updateChangeProcedureTypeSession,
	changeDateAndTimeRouter
);

router.use(
	'/:procedureType/estimation',
	controller.updateChangeProcedureTypeSession,
	changeEstimationRouter
);

router.use(
	'/:procedureType/address-known',
	controller.updateChangeProcedureTypeSession,
	changeAddressKnownRouter
);

router.use(
	'/:procedureType/address-details',
	controller.updateChangeProcedureTypeSession,
	changeAddressDetailsRouter
);

router.use(
	'/:procedureType/change-timetable',
	controller.updateChangeProcedureTypeSession,
	changeTimetableRouter
);

router.use(
	'/:procedureType/check-and-confirm',
	controller.updateChangeProcedureTypeSession,
	checkAndConfirmRouter
);

export default router;
