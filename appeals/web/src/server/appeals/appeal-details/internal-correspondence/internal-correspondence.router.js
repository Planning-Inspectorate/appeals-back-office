import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import * as controller from './internal-correspondence.controller.js';
import {
	validateCaseFolderId,
	validateCaseDocumentId
} from '../../appeal-documents/appeal-documents.middleware.js';
import { validateAppeal } from '../appeal-details.middleware.js';
import * as documentsValidators from '../../appeal-documents/appeal-documents.validators.js';
import { assertUserHasPermission } from '#app/auth/auth.guards.js';
import { permissionNames } from '#environment/permissions.js';

const router = createRouter({ mergeParams: true });

router
	.route('/:correspondenceCategory/upload-documents/:folderId')
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
	.route('/:correspondenceCategory/upload-documents/:folderId/:documentId')
	.get(
		validateAppeal,
		validateCaseFolderId,
		assertUserHasPermission(permissionNames.updateCase),
		asyncHandler(controller.getDocumentVersionUpload)
	)
	.post(
		validateAppeal,
		validateCaseFolderId,
		assertUserHasPermission(permissionNames.updateCase),
		asyncHandler(controller.postDocumentVersionUpload)
	);

router
	.route([
		'/:correspondenceCategory/add-document-details/:folderId',
		'/:correspondenceCategory/add-document-details/:folderId/:documentId'
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
		asyncHandler(controller.postAddDocumentDetails)
	);

router
	.route('/:correspondenceCategory/check-your-answers/:folderId')
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
	.route('/:correspondenceCategory/check-your-answers/:folderId/:documentId')
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
	.route('/:correspondenceCategory/manage-documents/:folderId')
	.get(validateCaseFolderId, asyncHandler(controller.getManageFolder));

router
	.route('/:correspondenceCategory/manage-documents/:folderId/:documentId')
	.get(validateCaseFolderId, asyncHandler(controller.getManageDocument));

router
	.route('/:correspondenceCategory/change-document-name/:folderId/:documentId')
	.get(
		validateAppeal,
		assertUserHasPermission(permissionNames.updateCase),
		validateCaseFolderId,
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
	.route('/:correspondenceCategory/change-document-details/:folderId/:documentId')
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
		asyncHandler(controller.postChangeDocumentVersionDetails)
	);

router
	.route('/:correspondenceCategory/manage-documents/:folderId/:documentId/:versionId/delete')
	.get(
		validateCaseFolderId,
		validateCaseDocumentId,
		assertUserHasPermission(permissionNames.updateCase),
		asyncHandler(controller.getDeleteInternalCorrespondenceDocument)
	)
	.post(
		validateCaseFolderId,
		validateCaseDocumentId,
		assertUserHasPermission(permissionNames.updateCase),
		documentsValidators.validateDocumentDeleteAnswer,
		asyncHandler(controller.postDeleteInternalCorrespondenceDocument)
	);

export default router;
