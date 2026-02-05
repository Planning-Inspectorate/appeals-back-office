import { assertUserHasPermission } from '#app/auth/auth.guards.js';
import { permissionNames } from '#environment/permissions.js';
import { extractAndProcessDateErrors } from '#lib/validators/date-input.validator.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import {
	getCheckDetailsAndMarkEnforcementAsInvalid,
	getEnforcementNoticeInvalid,
	getEnforcementNoticeReason,
	postCheckDetailsAndMarkEnforcementAsInvalid,
	postEnforcementNoticeInvalid,
	postEnforcementNoticeReason
} from '../../invalid-appeal/invalid-appeal.controller.js';
import {
	validateEnforcementNoticeInvalid,
	validateEnforcementNoticeReason,
	validateEnforcementNoticeReasonTextItems
} from '../../invalid-appeal/invalid-appeal.validators.js';
import {
	getEnforcementOtherInformation,
	postEnforcementOtherInformation
} from '../outcome-valid/outcome-valid.controller.js';
import {
	validateOtherInformation,
	validateOtherInterestInLand
} from '../outcome-valid/outcome-valid.validators.js';
import {
	dateFieldNamePrefix,
	feeReceiptDateFieldNamePrefix
} from './outcome-incomplete.constants.js';
import * as controller from './outcome-incomplete.controller.js';
import * as validators from './outcome-incomplete.validators.js';

const router = createRouter({ mergeParams: true });

router
	.route('/')
	.get(controller.getIncompleteReason)
	.post(
		validators.validateIncompleteReason,
		validators.validateIncompleteReasonTextItems,
		controller.postIncompleteReason
	);

router
	.route('/date')
	.get(controller.getUpdateDueDate)
	.post(
		validators.validateDueDateFields,
		validators.validateDueDateValid,
		validators.validateDueDateInFuture,
		extractAndProcessDateErrors({
			fieldNamePrefix: dateFieldNamePrefix
		}),
		controller.postUpdateDueDate
	);

router
	.route('/enforcement-notice')
	.get(getEnforcementNoticeInvalid)
	.post(validateEnforcementNoticeInvalid, postEnforcementNoticeInvalid);

router
	.route('/enforcement-notice-reason')
	.get(getEnforcementNoticeReason)
	.post(
		validateEnforcementNoticeReason,
		validateEnforcementNoticeReasonTextItems,
		postEnforcementNoticeReason
	);

router
	.route('/enforcement-other-information')
	.get(getEnforcementOtherInformation)
	.post(
		validateOtherInformation,
		validateOtherInterestInLand,
		asyncHandler(postEnforcementOtherInformation)
	);

router
	.route('/check-details-and-mark-enforcement-as-incomplete')
	.get(getCheckDetailsAndMarkEnforcementAsInvalid)
	.post(
		assertUserHasPermission(permissionNames.setCaseOutcome),
		asyncHandler(postCheckDetailsAndMarkEnforcementAsInvalid)
	);

router
	.route('/missing-documents')
	.get(controller.getMissingDocuments)
	.post(
		validators.validateMissingDocumentReason,
		validators.validateMissingDocumentReasonTextItems,
		controller.postMissingDocuments
	);

router
	.route('/receipt-due-date')
	.get(controller.getRecieptDueDate)
	.post(
		validators.validateFeeRecieptDueDateFields,
		validators.validateFeeRecieptDueDateValid,
		validators.validateFeeRecieptDueDateInFuture,
		extractAndProcessDateErrors({
			fieldNamePrefix: feeReceiptDateFieldNamePrefix
		}),
		controller.postReceiptDueDate
	);

export default router;
