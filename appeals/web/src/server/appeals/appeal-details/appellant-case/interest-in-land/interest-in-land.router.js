import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controllers from './interest-in-land.controller.js';
import {
	validateIncompleteReason,
	validateOtherInterestInLand
} from './interest-in-land.validator.js';
// import {
//     validateInquiryNumberOfWitnesses,
//     validateProcedurePreferenceDetails,
//     validateProcedurePreferenceDuration
// } from './procedure-preference.validators.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(asyncHandler(controllers.getChangeInterestInLand))
	.post(
		validateIncompleteReason,
		validateOtherInterestInLand,
		asyncHandler(controllers.postChangeInterestInLand)
	);

export default router;
