import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import { validateAppeal } from '../../appeal-details.middleware.js';
import * as controllers from './procedure-preference.controller.js';
import {
	validateProcedurePreferenceDetails,
	validateProcedurePreferenceDuration
} from './procedure-preference.validators.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(validateAppeal, asyncHandler(controllers.getChangeProcedurePreference))
	.post(validateAppeal, asyncHandler(controllers.postChangeProcedurePreference));

router
	.route('/details/change')
	.get(validateAppeal, asyncHandler(controllers.getChangeProcedurePreferenceDetails))
	.post(
		validateAppeal,
		validateProcedurePreferenceDetails,
		asyncHandler(controllers.postChangeProcedurePreferenceDetails)
	);

router
	.route('/duration/change')
	.get(validateAppeal, asyncHandler(controllers.getChangeProcedurePreferenceDuration))
	.post(
		validateAppeal,
		validateProcedurePreferenceDuration,
		asyncHandler(controllers.postChangeProcedurePreferenceDuration)
	);

export default router;
