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

router
	.route('/')
	.get(renderRedact)
	.post(saveBodyToSession('redactRule6PartyStatement'), postRedact);

router
	.route('/allocation-check')
	.get(renderAllocationCheck)
	.post(
		createYesNoRadioValidator(
			'allocationLevelAndSpecialisms',
			'Select whether the allocation level and specialisms need updating'
		),
		saveBodyToSession('redactRule6PartyStatement'),
		postAllocationCheck
	);

router
	.route('/allocation-level')
	.get(renderAllocationLevel)
	.post(
		validateAllocationLevel,
		saveBodyToSession('redactRule6PartyStatement'),
		postAllocationLevel
	);

router
	.route('/allocation-specialisms')
	.get(renderAllocationSpecialisms)
	.post(
		validateAllocationSpecialisms,
		saveBodyToSession('redactRule6PartyStatement'),
		postAllocationSpecialisms
	);

router.route('/confirm').get(renderConfirm).post(postConfirm);

export default router;
