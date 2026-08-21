import { assertUserHasPermission } from '#app/auth/auth.guards.js';
import { validateCaseFolderId } from '#appeals/appeal-documents/appeal-documents.middleware.js';
import { permissionNames } from '#environment/permissions.js';
import { extractAndProcessDocumentDateErrors } from '#lib/validators/date-input.validator.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as documentsValidators from '../../../appeal-documents/appeal-documents.validators.js';
import * as controller from './inquiry-documents.controller.js';

const router = createRouter({ mergeParams: true });

router.param('folderId', (req, res, next) => {
	validateCaseFolderId(req, res, next);
});

router
	.route('/upload-documents/:folderId')
	.get(
		assertUserHasPermission(permissionNames.updateCase),
		asyncHandler(controller.getInquiryDocumentUpload)
	)
	.post(
		assertUserHasPermission(permissionNames.updateCase),
		asyncHandler(controller.postInquiryDocumentUpload)
	);

router.route('/manage-documents/:folderId').get(asyncHandler(controller.getManageFolder));

router
	.route('/manage-documents/:folderId/:documentId')
	.get(asyncHandler(controller.getManageDocument));

router
	.route('/add-document-details/:folderId')
	.get(
		assertUserHasPermission(permissionNames.updateCase),
		asyncHandler(controller.getAddDocumentDetails)
	)
	.post(
		documentsValidators.validateDocumentDetailsBodyFormat,
		documentsValidators.validateDocumentDetailsReceivedDatesFields,
		documentsValidators.validateDocumentDetailsReceivedDateValid,
		documentsValidators.validateDocumentDetailsReceivedDateIsNotFutureDate,
		documentsValidators.validateDocumentDetailsRedactionStatuses,
		assertUserHasPermission(permissionNames.updateCase),
		extractAndProcessDocumentDateErrors(),
		asyncHandler(controller.postAddDocumentDetails)
	);

router
	.route('/upload-documents/:folderId/:documentId')
	.get(
		assertUserHasPermission(permissionNames.updateCase),
		asyncHandler(controller.getInquiryDocumentVersionUpload)
	)
	.post(
		assertUserHasPermission(permissionNames.updateCase),
		asyncHandler(controller.postInquiryDocumentVersionUpload)
	);

router
	.route('/add-document-details/:folderId/:documentId')
	.get(
		assertUserHasPermission(permissionNames.updateCase),
		asyncHandler(controller.getAddDocumentDetails)
	)
	.post(
		documentsValidators.validateDocumentDetailsBodyFormat,
		documentsValidators.validateDocumentDetailsReceivedDatesFields,
		documentsValidators.validateDocumentDetailsReceivedDateValid,
		documentsValidators.validateDocumentDetailsReceivedDateIsNotFutureDate,
		documentsValidators.validateDocumentDetailsRedactionStatuses,
		assertUserHasPermission(permissionNames.updateCase),
		extractAndProcessDocumentDateErrors(),
		asyncHandler(controller.postAddDocumentDetails)
	);

router
	.route('/check-your-answers/:folderId')
	.get(asyncHandler(controller.getAddInquiryDocumentsCheckAndConfirm))
	.post(
		assertUserHasPermission(permissionNames.updateCase),
		asyncHandler(controller.postAddInquiryDocumentsCheckAndConfirm)
	);

router
	.route('/check-your-answers/:folderId/:documentId')
	.get(asyncHandler(controller.getAddInquiryDocumentsCheckAndConfirm))
	.post(
		assertUserHasPermission(permissionNames.updateCase),
		asyncHandler(controller.postAddDocumentVersionCheckAndConfirm)
	);

router
	.route([
		'/change-document-details/:folderId/:documentId',
		'/change-document-details/:folderId/:documentId'
	])
	.get(
		assertUserHasPermission(permissionNames.updateCase),
		asyncHandler(controller.getChangeInquiryDocumentVersionDetails)
	)
	.post(
		assertUserHasPermission(permissionNames.updateCase),
		documentsValidators.validateDocumentDetailsBodyFormat,
		documentsValidators.validateDocumentDetailsReceivedDatesFields,
		documentsValidators.validateDocumentDetailsReceivedDateValid,
		documentsValidators.validateDocumentDetailsReceivedDateIsNotFutureDate,
		documentsValidators.validateDocumentDetailsRedactionStatuses,
		extractAndProcessDocumentDateErrors(),
		asyncHandler(controller.postChangeInquiryDocumentVersionDetails)
	);

export default router;
