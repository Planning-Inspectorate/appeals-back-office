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
import * as controller from './internal-correspondence.controller.js';

const router = createRouter({ mergeParams: true });
router.param('folderId', (req, res, next) => {
	validateCaseFolderId(req, res, next);
});

router
	.route('/:correspondenceCategory/upload-documents/:folderId')
	.get(
		assertUserHasPermission(permissionNames.viewCaseDetails),
		asyncHandler(controller.getDocumentUpload)
	)
	.post(
		assertUserHasPermission(permissionNames.viewCaseDetails),
		asyncHandler(controller.postDocumentUploadPage)
	);

router
	.route('/:correspondenceCategory/upload-documents/:folderId/:documentId')
	.get(
		assertUserHasPermission(permissionNames.viewCaseDetails),
		asyncHandler(controller.getDocumentVersionUpload)
	)
	.post(
		assertUserHasPermission(permissionNames.viewCaseDetails),
		asyncHandler(controller.postDocumentVersionUpload)
	);

router
	.route([
		'/:correspondenceCategory/add-document-details/:folderId',
		'/:correspondenceCategory/add-document-details/:folderId/:documentId'
	])
	.get(
		assertUserHasPermission(permissionNames.viewCaseDetails),
		asyncHandler(controller.getAddDocumentDetails)
	)
	.post(
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
		assertUserHasPermission(permissionNames.viewCaseDetails),
		asyncHandler(controller.getAddDocumentsCheckAndConfirm)
	)
	.post(
		assertUserHasPermission(permissionNames.viewCaseDetails),
		asyncHandler(controller.postAddDocumentsCheckAndConfirm)
	);

router
	.route('/:correspondenceCategory/check-your-answers/:folderId/:documentId')
	.get(
		assertUserHasPermission(permissionNames.viewCaseDetails),
		asyncHandler(controller.getAddDocumentsCheckAndConfirm)
	)
	.post(
		assertUserHasPermission(permissionNames.viewCaseDetails),
		asyncHandler(controller.postAddDocumentVersionCheckAndConfirm)
	);

router
	.route('/:correspondenceCategory/manage-documents/:folderId')
	.get(asyncHandler(controller.getManageFolder));

router
	.route('/:correspondenceCategory/manage-documents/:folderId/:documentId')
	.get(asyncHandler(controller.getManageDocument));

router
	.route('/:correspondenceCategory/change-document-name/:folderId/:documentId')
	.get(
		assertUserHasPermission(permissionNames.viewCaseDetails),

		asyncHandler(controller.getChangeDocumentFileNameDetails)
	)
	.post(
		assertUserHasPermission(permissionNames.viewCaseDetails),

		documentsValidators.validateDocumentNameBodyFormat,
		documentsValidators.validateDocumentName,
		asyncHandler(controller.postChangeDocumentFileNameDetails)
	);

router
	.route('/:correspondenceCategory/change-document-details/:folderId/:documentId')
	.get(
		assertUserHasPermission(permissionNames.viewCaseDetails),

		asyncHandler(controller.getChangeDocumentVersionDetails)
	)
	.post(
		assertUserHasPermission(permissionNames.viewCaseDetails),

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
		validateCaseDocumentId,
		assertUserHasPermission(permissionNames.viewCaseDetails),
		asyncHandler(controller.getDeleteInternalCorrespondenceDocument)
	)
	.post(
		validateCaseDocumentId,
		assertUserHasPermission(permissionNames.viewCaseDetails),
		documentsValidators.validateDocumentDeleteAnswer,
		asyncHandler(controller.postDeleteInternalCorrespondenceDocument)
	);

export default router;
