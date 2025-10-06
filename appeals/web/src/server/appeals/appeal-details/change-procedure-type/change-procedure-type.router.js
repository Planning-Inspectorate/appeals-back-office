import changeAddressDetailsRouter from '#appeals/appeal-details/change-procedure-type/change-procedure-address-details/change-procedure-address-details.router.js';
import changeAddressKnownRouter from '#appeals/appeal-details/change-procedure-type/change-procedure-address-known/change-procedure-address-known.router.js';
import checkAndConfirmRouter from '#appeals/appeal-details/change-procedure-type/change-procedure-check-and-confirm/change-procedure-check-and-confirm.router.js';
import changeDateAndTimeRouter from '#appeals/appeal-details/change-procedure-type/change-procedure-date-and-time/change-procedure-date-and-time.router.js';
import changeEstimationRouter from '#appeals/appeal-details/change-procedure-type/change-procedure-estimation/change-procedure-estimation.router.js';
import changeEventKnownRouter from '#appeals/appeal-details/change-procedure-type/change-procedure-event-date-known/change-procedure-event-date-known.router.js';
import changeProcedureSelectionRouter from '#appeals/appeal-details/change-procedure-type/change-procedure-selection/change-procedure-selection.router.js';
import changeTimetableRouter from '#appeals/appeal-details/change-procedure-type/change-procedure-timetable/change-procedure-timetable.router.js';
import { Router as createRouter } from 'express';
import * as controller from './change-procedure-type.controller.js';

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
