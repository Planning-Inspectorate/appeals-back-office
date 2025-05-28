import { Router } from 'express';
import { createYesNoRadioValidator } from '#lib/validators/radio.validator.js';
import { saveBodyToSession } from '#lib/middleware/save-body-to-session.js';
import {
	validateAllocationLevel,
	validateAllocationSpecialisms
} from '../allocation/allocation.validator.js';
import {
	renderAllocationCheck,
	renderAllocationLevel,
	renderAllocationSpecialisms,
	renderConfirm,
	postAllocationCheck,
	postAllocationLevel,
	postAllocationSpecialisms,
	postAcceptStatement
} from './valid.controller.js';

const router = Router({ mergeParams: true });

router
	.route('/allocation-check')
	.get(renderAllocationCheck)
	.post(
		createYesNoRadioValidator(
			'allocationLevelAndSpecialisms',
			'Select whether the allocation level and specialisms need updating'
		),
		saveBodyToSession('acceptLPAStatement', { scopeToAppeal: true }),
		postAllocationCheck
	);

router
	.route('/allocation-level')
	.get(renderAllocationLevel)
	.post(
		validateAllocationLevel,
		saveBodyToSession('acceptLPAStatement', { scopeToAppeal: true }),
		postAllocationLevel
	);

router
	.route('/allocation-specialisms')
	.get(renderAllocationSpecialisms)
	.post(
		validateAllocationSpecialisms,
		saveBodyToSession('acceptLPAStatement', { scopeToAppeal: true }),
		postAllocationSpecialisms
	);

router.route('/confirm').get(renderConfirm).post(postAcceptStatement);

export default router;
