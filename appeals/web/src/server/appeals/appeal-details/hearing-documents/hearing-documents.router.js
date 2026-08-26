import { assertUserHasPermission } from '#app/auth/auth.guards.js';
import { permissionNames } from '#environment/permissions.js';
import { extractAndProcessDocumentDateErrors } from '#lib/validators/date-input.validator.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import {
	validateCaseDocumentId,
	validateCaseFolderId
} from '../../appeal-documents/appeal-documents.middleware.js';
import * as documentsValidators from '../../appeal-documents/appeal-documents.validators.js';
import * as controller from './hearing-documents.controller.js';

const router = createRouter({ mergeParams: true });
router.param('folderId', (req, res, next) => {
	validateCaseFolderId(req, res, next);
});

router
	.route(['/upload-documents/:folderId', '/upload-documents/:folderId'])
	.get(
		assertUserHasPermission(permissionNames.updateCase),
		asyncHandler(controller.getDocumentUpload)
	)
	.post(
		assertUserHasPermission(permissionNames.updateCase),
		asyncHandler(controller.postDocumentUploadPage)
	);

router
	.route(['/upload-documents/:folderId/:documentId', '/upload-documents/:folderId/:documentId'])
	.get(asyncHandler(controller.getDocumentVersionUpload))
	.post(
		assertUserHasPermission(permissionNames.updateCase),
		asyncHandler(controller.postDocumentVersionUpload)
	);

router
	.route([
		'/add-document-details/:folderId',
		'/add-document-details/:folderId/:documentId',
		'/add-document-details/:folderId',
		'/add-document-details/:folderId/:documentId'
	])
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
	.get(
		assertUserHasPermission(permissionNames.updateCase),
		asyncHandler(controller.getAddDocumentsCheckAndConfirm)
	)
	.post(
		assertUserHasPermission(permissionNames.updateCase),
		asyncHandler(controller.postAddDocumentsCheckAndConfirm)
	);

router
	.route('/check-your-answers/:folderId/:documentId')
	.get(
		assertUserHasPermission(permissionNames.updateCase),
		asyncHandler(controller.getAddDocumentsCheckAndConfirm)
	)
	.post(
		assertUserHasPermission(permissionNames.updateCase),
		asyncHandler(controller.postAddDocumentVersionCheckAndConfirm)
	);

router
	.route(['/manage-documents/:folderId', '/manage-documents/:folderId'])
	.get(asyncHandler(controller.getManageFolder));

router
	.route(['/manage-documents/:folderId/:documentId', '/manage-documents/:folderId/:documentId'])
	.get(asyncHandler(controller.getManageDocument));

router
	.route([
		'/manage-documents/:folderId/:documentId/:versionId/delete',
		'/manage-documents/:folderId/:documentId/:versionId/delete'
	])
	.get(
		validateCaseDocumentId,
		assertUserHasPermission(permissionNames.updateCase),
		asyncHandler(controller.getDeleteHearingDocument)
	)
	.post(
		validateCaseDocumentId,
		assertUserHasPermission(permissionNames.updateCase),
		documentsValidators.validateDocumentDeleteAnswer,
		asyncHandler(controller.postDeleteHearingDocument)
	);

router
	.route([
		'/change-document-name/:folderId/:documentId',
		'/change-document-name/:folderId/:documentId'
	])
	.get(
		assertUserHasPermission(permissionNames.updateCase),
		assertUserHasPermission(permissionNames.updateCase),
		asyncHandler(controller.getChangeDocumentFileNameDetails)
	)
	.post(
		assertUserHasPermission(permissionNames.updateCase),
		documentsValidators.validateDocumentNameBodyFormat,
		documentsValidators.validateDocumentName,
		asyncHandler(controller.postChangeDocumentFileNameDetails)
	);

router
	.route([
		'/change-document-details/:folderId/:documentId',
		'/change-document-details/:folderId/:documentId'
	])
	.get(
		assertUserHasPermission(permissionNames.updateCase),
		asyncHandler(controller.getChangeDocumentVersionDetails)
	)
	.post(
		assertUserHasPermission(permissionNames.updateCase),
		documentsValidators.validateDocumentDetailsBodyFormat,
		documentsValidators.validateDocumentDetailsReceivedDatesFields,
		documentsValidators.validateDocumentDetailsReceivedDateValid,
		documentsValidators.validateDocumentDetailsReceivedDateIsNotFutureDate,
		documentsValidators.validateDocumentDetailsRedactionStatuses,
		extractAndProcessDocumentDateErrors(),
		asyncHandler(controller.postChangeDocumentVersionDetails)
	);

router
	.route('/check-and-confirm/:folderId/:documentId')
	.get(
		assertUserHasPermission(permissionNames.updateCase),
		asyncHandler(controller.getAddDocumentsCheckAndConfirm)
	)
	.post(
		assertUserHasPermission(permissionNames.updateCase),
		asyncHandler(controller.postAddDocumentVersionCheckAndConfirm)
	);

export default router;
