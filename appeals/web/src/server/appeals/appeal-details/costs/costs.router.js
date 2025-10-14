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
import * as controller from './costs.controller.js';
import { validatePostDecisionConfirmation } from './costs.validators.js';

const router = createRouter({ mergeParams: true });
router.param('folderId', (req, res, next) => {
	validateCaseFolderId(req, res, next);
});

router
	.route([
		'/:costsCategory/:costsDocumentType/upload-documents/:folderId',
		'/:costsCategory/upload-documents/:folderId'
	])
	.get(
		assertUserHasPermission(permissionNames.updateCase),
		asyncHandler(controller.getDocumentUpload)
	)
	.post(
		assertUserHasPermission(permissionNames.updateCase),
		asyncHandler(controller.postDocumentUploadPage)
	);

router
	.route([
		'/:costsCategory/:costsDocumentType/upload-documents/:folderId/:documentId',
		'/:costsCategory/upload-documents/:folderId/:documentId'
	])
	.get(asyncHandler(controller.getDocumentVersionUpload))
	.post(
		assertUserHasPermission(permissionNames.updateCase),
		asyncHandler(controller.postDocumentVersionUpload)
	);

router
	.route([
		'/:costsCategory/:costsDocumentType/add-document-details/:folderId',
		'/:costsCategory/:costsDocumentType/add-document-details/:folderId/:documentId',
		'/:costsCategory/add-document-details/:folderId',
		'/:costsCategory/add-document-details/:folderId/:documentId'
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
	.route('/:costsCategory/:costsDocumentType/check-your-answers/:folderId')
	.get(
		assertUserHasPermission(permissionNames.updateCase),
		asyncHandler(controller.getAddDocumentsCheckAndConfirm)
	)
	.post(
		assertUserHasPermission(permissionNames.updateCase),
		asyncHandler(controller.postAddDocumentsCheckAndConfirm)
	);

router
	.route('/:costsCategory/:costsDocumentType/check-your-answers/:folderId/:documentId')
	.get(
		assertUserHasPermission(permissionNames.updateCase),
		asyncHandler(controller.getAddDocumentsCheckAndConfirm)
	)
	.post(
		assertUserHasPermission(permissionNames.updateCase),
		asyncHandler(controller.postAddDocumentVersionCheckAndConfirm)
	);

router
	.route([
		'/:costsCategory/:costsDocumentType/manage-documents/:folderId',
		'/:costsCategory/manage-documents/:folderId'
	])
	.get(asyncHandler(controller.getManageFolder));

router
	.route([
		'/:costsCategory/:costsDocumentType/manage-documents/:folderId/:documentId',
		'/:costsCategory/manage-documents/:folderId/:documentId'
	])
	.get(asyncHandler(controller.getManageDocument));

router
	.route([
		'/:costsCategory/:costsDocumentType/manage-documents/:folderId/:documentId/:versionId/delete',
		'/:costsCategory/manage-documents/:folderId/:documentId/:versionId/delete'
	])
	.get(
		validateCaseDocumentId,
		assertUserHasPermission(permissionNames.updateCase),
		asyncHandler(controller.getDeleteCostsDocument)
	)
	.post(
		validateCaseDocumentId,
		assertUserHasPermission(permissionNames.updateCase),
		documentsValidators.validateDocumentDeleteAnswer,
		asyncHandler(controller.postDeleteCostsDocument)
	);

router
	.route([
		'/:costsCategory/:costsDocumentType/change-document-name/:folderId/:documentId',
		'/:costsCategory/change-document-name/:folderId/:documentId'
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
		'/:costsCategory/:costsDocumentType/change-document-details/:folderId/:documentId',
		'/:costsCategory/change-document-details/:folderId/:documentId'
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
	.route([
		'/decision/check-and-confirm/:folderId',
		'/decision/check-and-confirm/:folderId/:documentId'
	])
	.get(
		assertUserHasPermission(permissionNames.updateCase),
		asyncHandler(controller.getDecisionCheckAndConfirm)
	)
	.post(
		validatePostDecisionConfirmation,
		assertUserHasPermission(permissionNames.updateCase),
		asyncHandler(controller.postDecisionCheckAndConfirm)
	);

router
	.route('/:costsCategory/check-and-confirm/:folderId/:documentId')
	.get(
		assertUserHasPermission(permissionNames.updateCase),
		asyncHandler(controller.getAddDocumentsCheckAndConfirm)
	)
	.post(
		assertUserHasPermission(permissionNames.updateCase),
		asyncHandler(controller.postAddDocumentVersionCheckAndConfirm)
	);

export default router;
