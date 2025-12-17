import { extractAndProcessDateErrors } from '#lib/validators/date-input.validator.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import { enforcementEffectiveDateField } from './enforcement-effective-date.constants.js';
import * as controllers from './enforcement-effective-date.controller.js';
import * as validators from './enforcement-effective-date.validators.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(asyncHandler(controllers.getChangeEnforcementEffectiveDate))
	.post(
		validators.validateDueDateFields,
		validators.validateDueDateValid,
		extractAndProcessDateErrors({
			fieldNamePrefix: enforcementEffectiveDateField
		}),
		asyncHandler(controllers.postChangeEnforcementEffectiveDate)
	);

export default router;
