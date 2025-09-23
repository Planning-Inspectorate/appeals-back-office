import { saveBackUrl } from '#lib/middleware/save-back-url.js';
import { extractAndProcessDateErrors } from '#lib/validators/date-input.validator.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controller from './change-appeal-type.controller.js';
import * as validators from './change-appeal-type.validators.js';
import { changeAppealTypeDateField } from './change-appeal-types.constants.js';

const router = createRouter({ mergeParams: true });

router
	.route('/appeal-type')
	.get(saveBackUrl('changeAppealType'), asyncHandler(controller.getAppealType))
	.post(validators.validateAppealType, asyncHandler(controller.postAppealType));

router
	.route('/resubmit')
	.get(asyncHandler(controller.getResubmitAppeal))
	.post(validators.validateResubmitAppeal, asyncHandler(controller.postResubmitAppeal));

router
	.route('/mark-appeal-invalid')
	.get(asyncHandler(controller.getMarkAppealInvalid))
	.post(asyncHandler(controller.postMarkAppealInvalid));

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
	.post(asyncHandler(controller.postCheckTransfer));

router
	.route('/transfer-appeal')
	.get(asyncHandler(controller.getTransferAppeal))
	.post(asyncHandler(controller.postTransferAppeal));

router
	.route('/check-change-appeal-final-date')
	.get(asyncHandler(controller.getCheckChangeAppealFinalDate))
	.post(
		validators.validateChangeAppealFinalDateFields,
		validators.validateChangeAppealFinalDateValid,
		validators.validateChangeAppealFinalDateIsBusinessDay,
		validators.validateChangeAppealFinalDateInFuture,
		extractAndProcessDateErrors({ fieldNamePrefix: changeAppealTypeDateField }),
		asyncHandler(controller.postCheckChangeAppealFinalDate)
	);

router.route('/update-appeal').get(asyncHandler(controller.getUpdateAppeal));

export default router;
