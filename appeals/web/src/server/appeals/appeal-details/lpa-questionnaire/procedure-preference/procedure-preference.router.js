import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controllers from './procedure-preference.controller.js';
import {
	validateProcedurePreferenceDetails,
	validateProcedurePreferenceDuration
} from './procedure-preference.validators.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(asyncHandler(controllers.getChangeProcedurePreference))
	.post(asyncHandler(controllers.postChangeProcedurePreference));

router
	.route('/details/change')
	.get(asyncHandler(controllers.getChangeProcedurePreferenceDetails))
	.post(
		validateProcedurePreferenceDetails,
		asyncHandler(controllers.postChangeProcedurePreferenceDetails)
	);

router
	.route('/duration/change')
	.get(asyncHandler(controllers.getChangeProcedurePreferenceDuration))
	.post(
		validateProcedurePreferenceDuration,
		asyncHandler(controllers.postChangeProcedurePreferenceDuration)
	);

export default router;
