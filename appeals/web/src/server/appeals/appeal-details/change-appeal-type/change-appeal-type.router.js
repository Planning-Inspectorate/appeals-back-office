import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import * as controller from './change-appeal-type.controller.js';
import * as validators from './change-appeal-type.validators.js';
import { extractAndProcessDateErrors } from '#lib/validators/date-input.validator.js';
import { changeAppealTypeDateField } from './change-appeal-types.constants.js';

const router = createRouter({ mergeParams: true });

router
	.route('/appeal-type')
	.get(asyncHandler(controller.getAppealType))
	.post(validators.validateAppealType, asyncHandler(controller.postAppealType));

router
	.route('/resubmit')
	.get(asyncHandler(controller.getResubmitAppeal))
	.post(validators.validateResubmitAppeal, asyncHandler(controller.postResubmitAppeal));

router
	.route('/change-appeal-final-date')
	.get(asyncHandler(controller.getChangeAppealFinalDate))
	.post(
		validators.validateChangeAppealFinalDateFields,
		validators.validateChangeAppealFinalDateValid,
		validators.validateChangeAppealFinalDateIsBusinessDay,
		validators.validateChangeAppealFinalDateInFuture,
		extractAndProcessDateErrors({ fieldNamePrefix: changeAppealTypeDateField }),
		asyncHandler(controller.postChangeAppealFinalDate)
	);

router
	.route('/add-horizon-reference')
	.get(asyncHandler(controller.getAddHorizonReference))
	.post(validators.validateHorizonReference, asyncHandler(controller.postAddHorizonReference));

router
	.route('/check-transfer')
	.get(asyncHandler(controller.getCheckTransfer))
	.post(validators.validateCheckTransfer, asyncHandler(controller.postCheckTransfer));

export default router;
