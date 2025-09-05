import { saveBodyToSession } from '#lib/middleware/save-body-to-session.js';
import { createYesNoRadioValidator } from '#lib/validators/radio.validator.js';
import { Router } from 'express';
import {
	validateAllocationLevel,
	validateAllocationSpecialisms
} from '../allocation/allocation.validator.js';
import {
	postAllocationCheck,
	postAllocationLevel,
	postAllocationSpecialisms,
	postConfirm,
	postRedact,
	renderAllocationCheck,
	renderAllocationLevel,
	renderAllocationSpecialisms,
	renderConfirm,
	renderRedact
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
