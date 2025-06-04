import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import * as controller from './withdrawal.controller.js';
import * as validators from './withdrawal.validators.js';
import { extractAndProcessDateErrors } from '#lib/validators/date-input.validator.js';
import { dateFieldNamePrefix } from './withdrawl.constants.js';

const router = createRouter({ mergeParams: true });

router.route('/view').get(asyncHandler(controller.getViewWithdrawalDocumentFolder));

router
	.route('/start')
	.get(asyncHandler(controller.getWithdrawalRequestUpload))
	.post(asyncHandler(controller.postWithdrawalRequestRequestUpload));

router
	.route('/withdrawal-request-date')
	.get(asyncHandler(controller.getDateWithdrawalRequest))
	.post(
		validators.validateRequestDateFields,
		validators.validateRequestDateValid,
		validators.validateDueDateInPastOrToday,
		extractAndProcessDateErrors({ fieldNamePrefix: dateFieldNamePrefix }),
		asyncHandler(controller.postDateWithdrawalRequest)
	);

router
	.route('/redaction-status')
	.get(asyncHandler(controller.getRedactionStatus))
	.post(validators.validateRedactionStatus, asyncHandler(controller.postRedactionStatus));

router
	.route('/check-your-answers')
	.get(asyncHandler(controller.getCheckYourAnswers))
	.post(validators.validateCheckYourAnswers, asyncHandler(controller.postCheckYourAnswers));

export default router;
