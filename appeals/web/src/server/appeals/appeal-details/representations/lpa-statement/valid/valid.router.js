import { Router } from 'express';
import { createYesNoRadioValidator } from '#lib/validators/radio.validator.js';
import { renderAllocationCheck, postAllocationCheck } from './valid.controller.js';

const router = Router({ mergeParams: true });

router
	.route('/allocation-check')
	.get(renderAllocationCheck)
	.post(
		createYesNoRadioValidator(
			'allocationLevelAndSpecialisms',
			'Select whether you need to update the allocation level and specialisms'
		),
		postAllocationCheck
	);

export default router;
