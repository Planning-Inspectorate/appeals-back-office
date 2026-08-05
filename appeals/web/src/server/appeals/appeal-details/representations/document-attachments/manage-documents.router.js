import { assertUserHasPermission } from '#app/auth/auth.guards.js';
import {
	validateCaseDocumentId,
	validateCaseFolderId
} from '#appeals/appeal-documents/appeal-documents.middleware.js';
import { permissionNames } from '#environment/permissions.js';
import { extractAndProcessDocumentDateErrors } from '#lib/validators/date-input.validator.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as documentsValidators from '../../../appeal-documents/appeal-documents.validators.js';
import * as controller from './manage-documents.controller.js';

const router = createRouter({ mergeParams: true });
router.param('folderId', (req, res, next) => {
	validateCaseFolderId(req, res, next);
});

router
	.route('/')
	.get(
		assertUserHasPermission(permissionNames.updateCase),
		asyncHandler(controller.goToManageDocuments)
	);

router
	.route('/:folderId/')
	.get(
		assertUserHasPermission(permissionNames.updateCase),
		asyncHandler(controller.getManageFolder)
	);

router
	.route('/:folderId/:documentId')
	.get(
		assertUserHasPermission(permissionNames.updateCase),
		validateCaseDocumentId,
		asyncHandler(controller.getManageDocument)
	);

router
	.route('/change-document-name/:folderId/:documentId')
	.get(
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
	.route('/change-document-details/:folderId/:documentId')
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
	.route('/:folderId/:documentId/:versionId/delete')
	.get(
		assertUserHasPermission(permissionNames.updateCase),

		validateCaseDocumentId,
		asyncHandler(controller.getDeleteDocument)
	)
	.post(
		assertUserHasPermission(permissionNames.updateCase),

		validateCaseDocumentId,
		documentsValidators.validateDocumentDeleteAnswer,
		asyncHandler(controller.postDeleteDocumentPage)
	);

router
	.route('/add-documents/:folderId/:documentId')
	.get(validateCaseDocumentId, asyncHandler(controller.getAddDocumentVersion))
	.post(
		assertUserHasPermission(permissionNames.updateCase),
		asyncHandler(controller.postAddDocumentVersion)
	);

router
	.route('/add-document-details/:folderId/:documentId')
	.get(asyncHandler(controller.getAddDocumentVersionDetails))
	.post(
		assertUserHasPermission(permissionNames.updateCase),

		documentsValidators.validateDocumentDetailsBodyFormat,
		documentsValidators.validateDocumentDetailsReceivedDatesFields,
		documentsValidators.validateDocumentDetailsReceivedDateValid,
		documentsValidators.validateDocumentDetailsReceivedDateIsNotFutureDate,
		documentsValidators.validateDocumentDetailsRedactionStatuses,
		extractAndProcessDocumentDateErrors(),
		asyncHandler(controller.postDocumentVersionDetails)
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

export default router;
