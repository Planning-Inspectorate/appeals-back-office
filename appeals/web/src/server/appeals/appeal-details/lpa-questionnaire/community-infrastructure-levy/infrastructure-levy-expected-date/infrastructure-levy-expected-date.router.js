import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import * as controllers from './infrastructure-levy-expected-date.controller.js';
import * as validators from './infrastructure-levy-expected-date.validator.js';
import { extractAndProcessDateErrors } from '#lib/validators/date-input.validator.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(asyncHandler(controllers.getChangeInfrastructureLevyExpectedDate))
	.post(
		validators.validateDueDateFields,
		validators.validateDueDateValid,
		extractAndProcessDateErrors({ fieldNamePrefix: 'levy-expected-date' }),
		asyncHandler(controllers.postChangeInfrastructureLevyExpectedDate)
	);

export default router;
