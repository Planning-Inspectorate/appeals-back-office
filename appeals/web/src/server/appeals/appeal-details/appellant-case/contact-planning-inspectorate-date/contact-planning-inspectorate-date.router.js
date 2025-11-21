import { extractAndProcessDateErrors } from '#lib/validators/date-input.validator.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import { contactPlanningInspectorateDateField } from './contact-planning-inspectorate-date.constants.js';
import * as controllers from './contact-planning-inspectorate-date.controller.js';
import * as validators from './contact-planning-inspectorate-date.validators.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(asyncHandler(controllers.getChangeContactPlanningInspectorateDate))
	.post(
		validators.validateDueDateFields,
		validators.validateDueDateValid,
		validators.validateDueDateInPastOrToday,
		extractAndProcessDateErrors({
			fieldNamePrefix: contactPlanningInspectorateDateField
		}),
		asyncHandler(controllers.postChangeContactPlanningInspectorateDate)
	);

export default router;
