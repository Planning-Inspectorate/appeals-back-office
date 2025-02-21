import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import {
	validateCaseDocumentId,
	validateCaseFolderId
} from '#appeals/appeal-documents/appeal-documents.middleware.js';
import { permissionNames } from '#environment/permissions.js';
import { assertUserHasPermission } from '#app/auth/auth.guards.js';
import * as controller from './manage-documents.controller.js';
import { validateAppeal } from '#appeals/appeal-details/appeal-details.middleware.js';
import * as documentsValidators from '../../../appeal-documents/appeal-documents.validators.js';

const router = createRouter({ mergeParams: true });

router
	.route('/:folderId/')
	.get(
		assertUserHasPermission(permissionNames.updateCase),
		validateCaseFolderId,
		asyncHandler(controller.getManageFolder)
	);

router
	.route('/:folderId/:documentId')
	.get(
		assertUserHasPermission(permissionNames.updateCase),
		validateCaseFolderId,
		validateCaseDocumentId,
		asyncHandler(controller.getManageDocument)
	);

router
	.route('/change-document-name/:folderId/:documentId')
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
	.route('/change-document-details/:folderId/:documentId')
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
	.route('/:folderId/:documentId/:versionId/delete')
	.get(
		validateAppeal,
		assertUserHasPermission(permissionNames.updateCase),
		validateCaseFolderId,
		validateCaseDocumentId,
		asyncHandler(controller.getDeleteDocument)
	)
	.post(
		validateAppeal,
		assertUserHasPermission(permissionNames.updateCase),
		validateCaseFolderId,
		validateCaseDocumentId,
		documentsValidators.validateDocumentDeleteAnswer,
		asyncHandler(controller.postDeleteDocumentPage)
	);

router
	.route('/add-documents/:folderId/:documentId')
	.get(
		validateAppeal,
		validateCaseFolderId,
		validateCaseDocumentId,
		asyncHandler(controller.getAddDocumentVersion)
	)
	.post(
		validateAppeal,
		validateCaseFolderId,
		assertUserHasPermission(permissionNames.updateCase),
		asyncHandler(controller.postAddDocumentVersion)
	);

router
	.route('/add-document-details/:folderId/:documentId')
	.get(validateAppeal, validateCaseFolderId, asyncHandler(controller.getAddDocumentVersionDetails))
	.post(
		validateAppeal,
		assertUserHasPermission(permissionNames.updateCase),
		validateCaseFolderId,
		documentsValidators.validateDocumentDetailsBodyFormat,
		documentsValidators.validateDocumentDetailsReceivedDatesFields,
		documentsValidators.validateDocumentDetailsReceivedDateValid,
		documentsValidators.validateDocumentDetailsReceivedDateIsNotFutureDate,
		documentsValidators.validateDocumentDetailsRedactionStatuses,
		asyncHandler(controller.postDocumentVersionDetails)
	);

router
	.route('/check-your-answers/:folderId/:documentId')
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

export default router;
