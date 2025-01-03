import { Router } from 'express';
import { createYesNoRadioValidator } from '#lib/validators/radio.validator.js';
import { saveBodyToSession } from '#lib/middleware/save-body-to-session.js';
import { validateAllocationLevel, validateAllocationSpecialisms } from './valid.validator.js';
import {
	renderAllocationCheck,
	renderAllocationLevel,
	renderAllocationSpecialisms,
	postAllocationCheck,
	postAllocationLevel,
	postAllocationSpecialisms
} from './valid.controller.js';

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

router
	.route('/allocation-level')
	.get(renderAllocationLevel)
	.post(validateAllocationLevel, saveBodyToSession('allocationLevel'), postAllocationLevel);

router
	.route('/allocation-specialisms')
	.get(renderAllocationSpecialisms)
	.post(
		validateAllocationSpecialisms,
		saveBodyToSession('allocationSpecialisms'),
		postAllocationSpecialisms
	);

export default router;
