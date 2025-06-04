import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import * as controller from './costs.controller.js';
import {
	validateCaseFolderId,
	validateCaseDocumentId
} from '../../appeal-documents/appeal-documents.middleware.js';
import * as documentsValidators from '../../appeal-documents/appeal-documents.validators.js';
import { validatePostDecisionConfirmation } from './costs.validators.js';
import { validateAppeal } from '../appeal-details.middleware.js';
import { assertUserHasPermission } from '#app/auth/auth.guards.js';
import { permissionNames } from '#environment/permissions.js';
import { extractAndProcessDocumentDateErrors } from '#lib/validators/date-input.validator.js';

const router = createRouter({ mergeParams: true });

router
	.route([
		'/:costsCategory/:costsDocumentType/upload-documents/:folderId',
		'/:costsCategory/upload-documents/:folderId'
	])
	.get(
		validateAppeal,
		validateCaseFolderId,
		assertUserHasPermission(permissionNames.updateCase),
		asyncHandler(controller.getDocumentUpload)
	)
	.post(
		validateAppeal,
		validateCaseFolderId,
		assertUserHasPermission(permissionNames.updateCase),
		asyncHandler(controller.postDocumentUploadPage)
	);

router
	.route([
		'/:costsCategory/:costsDocumentType/upload-documents/:folderId/:documentId',
		'/:costsCategory/upload-documents/:folderId/:documentId'
	])
	.get(validateAppeal, validateCaseFolderId, asyncHandler(controller.getDocumentVersionUpload))
	.post(
		validateAppeal,
		validateCaseFolderId,
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
		validateAppeal,
		validateCaseFolderId,
		assertUserHasPermission(permissionNames.updateCase),
		asyncHandler(controller.getAddDocumentDetails)
	)
	.post(
		validateAppeal,
		validateCaseFolderId,
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
		validateAppeal,
		validateCaseFolderId,
		assertUserHasPermission(permissionNames.updateCase),
		asyncHandler(controller.getAddDocumentsCheckAndConfirm)
	)
	.post(
		validateAppeal,
		validateCaseFolderId,
		assertUserHasPermission(permissionNames.updateCase),
		asyncHandler(controller.postAddDocumentsCheckAndConfirm)
	);

router
	.route('/:costsCategory/:costsDocumentType/check-your-answers/:folderId/:documentId')
	.get(
		validateAppeal,
		validateCaseFolderId,
		assertUserHasPermission(permissionNames.updateCase),
		asyncHandler(controller.getAddDocumentsCheckAndConfirm)
	)
	.post(
		validateAppeal,
		validateCaseFolderId,
		assertUserHasPermission(permissionNames.updateCase),
		asyncHandler(controller.postAddDocumentVersionCheckAndConfirm)
	);

router
	.route([
		'/:costsCategory/:costsDocumentType/manage-documents/:folderId',
		'/:costsCategory/manage-documents/:folderId'
	])
	.get(validateCaseFolderId, asyncHandler(controller.getManageFolder));

router
	.route([
		'/:costsCategory/:costsDocumentType/manage-documents/:folderId/:documentId',
		'/:costsCategory/manage-documents/:folderId/:documentId'
	])
	.get(validateCaseFolderId, asyncHandler(controller.getManageDocument));

router
	.route([
		'/:costsCategory/:costsDocumentType/manage-documents/:folderId/:documentId/:versionId/delete',
		'/:costsCategory/manage-documents/:folderId/:documentId/:versionId/delete'
	])
	.get(
		validateCaseFolderId,
		validateCaseDocumentId,
		assertUserHasPermission(permissionNames.updateCase),
		asyncHandler(controller.getDeleteCostsDocument)
	)
	.post(
		validateCaseFolderId,
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
		validateAppeal,
		assertUserHasPermission(permissionNames.updateCase),
		validateCaseFolderId,
		assertUserHasPermission(permissionNames.updateCase),
		asyncHandler(controller.getChangeDocumentFileNameDetails)
	)
	.post(
		validateAppeal,
		assertUserHasPermission(permissionNames.updateCase),
		validateCaseFolderId,
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
		validateAppeal,
		assertUserHasPermission(permissionNames.updateCase),
		validateCaseFolderId,
		asyncHandler(controller.getChangeDocumentVersionDetails)
	)
	.post(
		validateAppeal,
		assertUserHasPermission(permissionNames.updateCase),
		validateCaseFolderId,
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
		validateCaseFolderId,
		assertUserHasPermission(permissionNames.updateCase),
		asyncHandler(controller.getDecisionCheckAndConfirm)
	)
	.post(
		validateCaseFolderId,
		validatePostDecisionConfirmation,
		assertUserHasPermission(permissionNames.updateCase),
		asyncHandler(controller.postDecisionCheckAndConfirm)
	);

router
	.route('/:costsCategory/check-and-confirm/:folderId/:documentId')
	.get(
		validateCaseFolderId,
		assertUserHasPermission(permissionNames.updateCase),
		asyncHandler(controller.getAddDocumentsCheckAndConfirm)
	)
	.post(
		validateCaseFolderId,
		assertUserHasPermission(permissionNames.updateCase),
		asyncHandler(controller.postAddDocumentVersionCheckAndConfirm)
	);

export default router;
