import { Router } from 'express';
import { createYesNoRadioValidator } from '#lib/validators/radio.validator.js';
import { saveBodyToSession } from '#lib/middleware/save-body-to-session.js';
import {
	validateAllocationLevel,
	validateAllocationSpecialisms
} from '../allocation/allocation.validator.js';
import {
	renderConfirm,
	renderRedact,
	postConfirm,
	postRedact,
	renderAllocationCheck,
	postAllocationCheck,
	renderAllocationLevel,
	postAllocationLevel,
	renderAllocationSpecialisms,
	postAllocationSpecialisms
} from './redact.controller.js';

const router = Router({ mergeParams: true });

router.route('/').get(renderRedact).post(saveBodyToSession('redactLPAStatement'), postRedact);

router
	.route('/allocation-check')
	.get(renderAllocationCheck)
	.post(
		createYesNoRadioValidator(
			'allocationLevelAndSpecialisms',
			'Select whether the allocation level and specialisms need updating'
		),
		saveBodyToSession('redactLPAStatement'),
		postAllocationCheck
	);

router
	.route('/allocation-level')
	.get(renderAllocationLevel)
	.post(validateAllocationLevel, saveBodyToSession('redactLPAStatement'), postAllocationLevel);

router
	.route('/allocation-specialisms')
	.get(renderAllocationSpecialisms)
	.post(
		validateAllocationSpecialisms,
		saveBodyToSession('redactLPAStatement'),
		postAllocationSpecialisms
	);

router.route('/confirm').get(renderConfirm).post(postConfirm);

export default router;
