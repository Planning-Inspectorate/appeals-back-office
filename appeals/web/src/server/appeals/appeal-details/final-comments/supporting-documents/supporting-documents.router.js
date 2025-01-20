import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import { validateAppeal } from '#appeals/appeal-details/appeal-details.middleware.js';
import { assertUserHasPermission } from '#app/auth/auth.guards.js';
import { permissionNames } from '#environment/permissions.js';
import * as documentsValidators from '#appeals/appeal-documents/appeal-documents.validators.js';
import * as controller from './supporting-documents.controller.js';

const router = createRouter({ mergeParams: true });

router
	.route('/add-documents')
	.get(
		validateAppeal,
		assertUserHasPermission(permissionNames.updateCase),
		asyncHandler(controller.getAddDocuments)
	)
	.post(validateAppeal, asyncHandler(controller.postAddDocuments));

router
	.route('/add-document-details')
	.get(
		validateAppeal,
		assertUserHasPermission(permissionNames.updateCase),
		asyncHandler(controller.getAddDocumentDetails)
	)
	.post(
		validateAppeal,
		assertUserHasPermission(permissionNames.updateCase),
		documentsValidators.validateDocumentDetailsBodyFormat,
		documentsValidators.validateDocumentDetailsReceivedDatesFields,
		documentsValidators.validateDocumentDetailsReceivedDateValid,
		documentsValidators.validateDocumentDetailsReceivedDateIsNotFutureDate,
		documentsValidators.validateDocumentDetailsRedactionStatuses,
		asyncHandler(controller.postAddDocumentDetails)
	);

router
	.route('/add-documents/check-your-answers')
	.get(validateAppeal, asyncHandler(controller.getAddDocumentsCheckAndConfirm))
	.post(validateAppeal, asyncHandler(controller.postAddDocumentsCheckAndConfirm));

// router
// 	.route('/add-documents/:folderId/:documentId')
// 	.get(
// 		validateAppeal,
// 		assertUserHasPermission(permissionNames.updateCase),
// 		validateCaseFolderId,
// 		validateCaseDocumentId,
// 		asyncHandler(controller.getAddDocumentVersion)
// 	)
// 	.post(validateAppeal, validateCaseFolderId, asyncHandler(controller.postAddDocumentVersion));

// router
// 	.route('/add-documents/:folderId/:documentId/check-your-answers')
// 	.get(
// 		validateAppeal,
// 		validateCaseFolderId,
// 		asyncHandler(controller.getAddDocumentsCheckAndConfirm)
// 	)
// 	.post(
// 		validateAppeal,
// 		validateCaseFolderId,
// 		asyncHandler(controller.postAddDocumentVersionCheckAndConfirm)
// 	);

// router
// 	.route('/add-document-details/:folderId/:documentId')
// 	.get(
// 		validateAppeal,
// 		assertUserHasPermission(permissionNames.updateCase),
// 		validateCaseFolderId,
// 		asyncHandler(controller.getAddDocumentVersionDetails)
// 	)
// 	.post(
// 		validateAppeal,
// 		assertUserHasPermission(permissionNames.updateCase),
// 		validateCaseFolderId,
// 		documentsValidators.validateDocumentDetailsBodyFormat,
// 		documentsValidators.validateDocumentDetailsReceivedDatesFields,
// 		documentsValidators.validateDocumentDetailsReceivedDateValid,
// 		documentsValidators.validateDocumentDetailsReceivedDateIsNotFutureDate,
// 		documentsValidators.validateDocumentDetailsRedactionStatuses,
// 		asyncHandler(controller.postDocumentVersionDetails)
// 	);

// router
// 	.route('/manage-documents/:folderId/')
// 	.get(
// 		assertUserHasPermission(permissionNames.updateCase),
// 		validateCaseFolderId,
// 		asyncHandler(controller.getManageFolder)
// 	);

// router
// 	.route('/manage-documents/:folderId/:documentId')
// 	.get(
// 		validateAppeal,
// 		assertUserHasPermission(permissionNames.updateCase),
// 		validateCaseFolderId,
// 		validateCaseDocumentId,
// 		asyncHandler(controller.getManageDocument)
// 	);

// router
// 	.route('/change-document-name/:folderId/:documentId')
// 	.get(
// 		validateAppeal,
// 		assertUserHasPermission(permissionNames.updateCase),
// 		validateCaseFolderId,
// 		asyncHandler(controller.getChangeDocumentFileNameDetails)
// 	)
// 	.post(
// 		validateAppeal,
// 		assertUserHasPermission(permissionNames.updateCase),
// 		validateCaseFolderId,
// 		documentsValidators.validateDocumentNameBodyFormat,
// 		documentsValidators.validateDocumentName,
// 		asyncHandler(controller.postChangeDocumentFileNameDetails)
// 	);

// router
// 	.route('/change-document-details/:folderId/:documentId')
// 	.get(
// 		validateAppeal,
// 		assertUserHasPermission(permissionNames.updateCase),
// 		validateCaseFolderId,
// 		asyncHandler(controller.getChangeDocumentVersionDetails)
// 	)
// 	.post(
// 		validateAppeal,
// 		assertUserHasPermission(permissionNames.updateCase),
// 		validateCaseFolderId,
// 		documentsValidators.validateDocumentDetailsBodyFormat,
// 		documentsValidators.validateDocumentDetailsReceivedDatesFields,
// 		documentsValidators.validateDocumentDetailsReceivedDateValid,
// 		documentsValidators.validateDocumentDetailsReceivedDateIsNotFutureDate,
// 		documentsValidators.validateDocumentDetailsRedactionStatuses,
// 		asyncHandler(controller.postChangeDocumentVersionDetails)
// 	);

// router
// 	.route('/manage-documents/:folderId/:documentId/:versionId/delete')
// 	.get(
// 		validateAppeal,
// 		assertUserHasPermission(permissionNames.updateCase),
// 		validateCaseFolderId,
// 		validateCaseDocumentId,
// 		asyncHandler(controller.getDeleteDocument)
// 	)
// 	.post(
// 		validateAppeal,
// 		assertUserHasPermission(permissionNames.updateCase),
// 		validateCaseFolderId,
// 		validateCaseDocumentId,
// 		documentsValidators.validateDocumentDeleteAnswer,
// 		asyncHandler(controller.postDeleteDocumentPage)
// 	);

export default router;
