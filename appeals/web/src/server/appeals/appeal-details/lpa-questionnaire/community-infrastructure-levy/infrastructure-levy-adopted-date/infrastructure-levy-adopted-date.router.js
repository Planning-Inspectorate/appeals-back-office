import { extractAndProcessDateErrors } from '#lib/validators/date-input.validator.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controllers from './infrastructure-levy-adopted-date.controller.js';
import * as validators from './infrastructure-levy-adopted-date.validator.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(asyncHandler(controllers.getChangeInfrastructureLevyAdoptedDate))
	.post(
		validators.validateDueDateFields,
		validators.validateDueDateValid,
		extractAndProcessDateErrors({ fieldNamePrefix: 'levy-adopted-date' }),
		asyncHandler(controllers.postChangeInfrastructureLevyAdoptedDate)
	);

export default router;
