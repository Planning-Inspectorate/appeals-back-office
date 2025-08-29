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
import { validateAppeal } from '../appeal-details.middleware.js';
import * as controller from './internal-correspondence.controller.js';

const router = createRouter({ mergeParams: true });

router
	.route('/:correspondenceCategory/upload-documents/:folderId')
	.get(
		validateAppeal,
		validateCaseFolderId,
		assertUserHasPermission(permissionNames.viewCaseDetails),
		asyncHandler(controller.getDocumentUpload)
	)
	.post(
		validateAppeal,
		validateCaseFolderId,
		assertUserHasPermission(permissionNames.viewCaseDetails),
		asyncHandler(controller.postDocumentUploadPage)
	);

router
	.route('/:correspondenceCategory/upload-documents/:folderId/:documentId')
	.get(
		validateAppeal,
		validateCaseFolderId,
		assertUserHasPermission(permissionNames.viewCaseDetails),
		asyncHandler(controller.getDocumentVersionUpload)
	)
	.post(
		validateAppeal,
		validateCaseFolderId,
		assertUserHasPermission(permissionNames.viewCaseDetails),
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
		assertUserHasPermission(permissionNames.viewCaseDetails),
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
		assertUserHasPermission(permissionNames.viewCaseDetails),
		extractAndProcessDocumentDateErrors(),
		asyncHandler(controller.postAddDocumentDetails)
	);

router
	.route('/:correspondenceCategory/check-your-answers/:folderId')
	.get(
		validateAppeal,
		validateCaseFolderId,
		assertUserHasPermission(permissionNames.viewCaseDetails),
		asyncHandler(controller.getAddDocumentsCheckAndConfirm)
	)
	.post(
		validateAppeal,
		validateCaseFolderId,
		assertUserHasPermission(permissionNames.viewCaseDetails),
		asyncHandler(controller.postAddDocumentsCheckAndConfirm)
	);

router
	.route('/:correspondenceCategory/check-your-answers/:folderId/:documentId')
	.get(
		validateAppeal,
		validateCaseFolderId,
		assertUserHasPermission(permissionNames.viewCaseDetails),
		asyncHandler(controller.getAddDocumentsCheckAndConfirm)
	)
	.post(
		validateAppeal,
		validateCaseFolderId,
		assertUserHasPermission(permissionNames.viewCaseDetails),
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
		assertUserHasPermission(permissionNames.viewCaseDetails),
		validateCaseFolderId,
		asyncHandler(controller.getChangeDocumentFileNameDetails)
	)
	.post(
		validateAppeal,
		assertUserHasPermission(permissionNames.viewCaseDetails),
		validateCaseFolderId,
		documentsValidators.validateDocumentNameBodyFormat,
		documentsValidators.validateDocumentName,
		asyncHandler(controller.postChangeDocumentFileNameDetails)
	);

router
	.route('/:correspondenceCategory/change-document-details/:folderId/:documentId')
	.get(
		validateAppeal,
		assertUserHasPermission(permissionNames.viewCaseDetails),
		validateCaseFolderId,
		asyncHandler(controller.getChangeDocumentVersionDetails)
	)
	.post(
		validateAppeal,
		assertUserHasPermission(permissionNames.viewCaseDetails),
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
	.route('/:correspondenceCategory/manage-documents/:folderId/:documentId/:versionId/delete')
	.get(
		validateCaseFolderId,
		validateCaseDocumentId,
		assertUserHasPermission(permissionNames.viewCaseDetails),
		asyncHandler(controller.getDeleteInternalCorrespondenceDocument)
	)
	.post(
		validateCaseFolderId,
		validateCaseDocumentId,
		assertUserHasPermission(permissionNames.viewCaseDetails),
		documentsValidators.validateDocumentDeleteAnswer,
		asyncHandler(controller.postDeleteInternalCorrespondenceDocument)
	);

export default router;
