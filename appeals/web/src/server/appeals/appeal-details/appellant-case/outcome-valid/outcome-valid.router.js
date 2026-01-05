import { extractAndProcessDateErrors } from '#lib/validators/date-input.validator.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controller from './outcome-valid.controller.js';
import * as validators from './outcome-valid.validators.js';

const router = createRouter({ mergeParams: true });

router
	.route('/date')
	.get(controller.getValidDate)
	.post(
		validators.validateValidDateFields('Valid date'),
		validators.validateValidDateValid('Valid date'),
		validators.validateValidDateInPastOrToday('Valid date'),
		extractAndProcessDateErrors({
			fieldNamePrefix: 'valid-date'
		}),
		asyncHandler(controller.postValidDate)
	);

router
	.route('/enforcement/ground-a')
	.get(controller.getEnforcementGroundA)
	.post(validators.validateGroundARadio, asyncHandler(controller.postEnforcementGroundA));

router
	.route('/enforcement/other-information')
	.get(controller.getEnforcementOtherInformation)
	.post(
		validators.validateOtherInformation,
		validators.validateOtherInterestInLand,
		asyncHandler(controller.postEnforcementOtherInformation)
	);

router
	.route('/enforcement/date')
	.get(controller.getEnforcementValidDate)
	.post(
		validators.validateValidDateFields('Decision date'),
		validators.validateValidDateValid('Decision date'),
		validators.validateValidDateInPastOrToday('Decision date'),
		extractAndProcessDateErrors({
			fieldNamePrefix: 'valid-date'
		}),
		asyncHandler(controller.postEnforcementValidDate)
	);

router
	.route('/enforcement/check-details')
	.get(controller.getEnforcementCheckDetails)
	.post(controller.postEnforcementCheckDetails);

export default router;
