import { Router as createRouter } from 'express';
import config from '#environment/config.js';
import { asyncHandler } from '@pins/express';
import * as controller from './costs.controller.js';
import {
	validateCaseFolderId,
	validateCaseDocumentId
} from '../../../appeal-documents/appeal-documents.middleware.js';
import * as documentsValidators from '../../../appeal-documents/appeal-documents.validators.js';
import { validatePostDecisionConfirmation } from './costs.validators.js';
import { assertGroupAccess } from '#app/auth/auth.guards.js';
import { validateAppeal } from '../../middleware.js';
import { assertUserHasPermission } from '#app/auth/auth.guards.js';
import { permissionNames } from '#environment/permissions.js';

const router = createRouter({ mergeParams: true });

router
	.route([
		'/:costsCategory/:costsDocumentType/upload-documents/:folderId',
		'/:costsCategory/upload-documents/:folderId'
	])
	.get(validateAppeal, validateCaseFolderId, asyncHandler(controller.getDocumentUpload))
	.post(validateAppeal, validateCaseFolderId, asyncHandler(controller.postDocumentUploadPage));

router
	.route([
		'/:costsCategory/:costsDocumentType/upload-documents/:folderId/:documentId',
		'/:costsCategory/upload-documents/:folderId/:documentId'
	])
	.get(validateAppeal, validateCaseFolderId, asyncHandler(controller.getDocumentVersionUpload))
	.post(validateAppeal, validateCaseFolderId, asyncHandler(controller.postDocumentVersionUpload));

router
	.route([
		'/:costsCategory/:costsDocumentType/add-document-details/:folderId',
		'/:costsCategory/:costsDocumentType/add-document-details/:folderId/:documentId',
		'/:costsCategory/add-document-details/:folderId',
		'/:costsCategory/add-document-details/:folderId/:documentId'
	])
	.get(validateAppeal, validateCaseFolderId, asyncHandler(controller.getAddDocumentDetails))
	.post(
		validateAppeal,
		validateCaseFolderId,
		documentsValidators.validateDocumentDetailsBodyFormat,
		documentsValidators.validateDocumentDetailsReceivedDatesFields,
		documentsValidators.validateDocumentDetailsReceivedDateValid,
		documentsValidators.validateDocumentDetailsReceivedDateIsNotFutureDate,
		documentsValidators.validateDocumentDetailsRedactionStatuses,
		assertGroupAccess(config.referenceData.appeals.caseOfficerGroupId),
		asyncHandler(controller.postAddDocumentDetails)
	);

router
	.route('/:costsCategory/:costsDocumentType/check-your-answers/:folderId')
	.get(
		validateAppeal,
		validateCaseFolderId,
		asyncHandler(controller.getAddDocumentsCheckAndConfirm)
	)
	.post(
		validateAppeal,
		validateCaseFolderId,
		asyncHandler(controller.postAddDocumentsCheckAndConfirm)
	);

router
	.route('/:costsCategory/:costsDocumentType/check-your-answers/:folderId/:documentId')
	.get(
		validateAppeal,
		validateCaseFolderId,
		asyncHandler(controller.getAddDocumentsCheckAndConfirm)
	)
	.post(
		validateAppeal,
		validateCaseFolderId,
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
		asyncHandler(controller.getDeleteCostsDocument)
	)
	.post(
		validateCaseFolderId,
		validateCaseDocumentId,
		documentsValidators.validateDocumentDeleteAnswer,
		asyncHandler(controller.postDeleteCostsDocument)
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
		assertGroupAccess(config.referenceData.appeals.caseOfficerGroupId),
		asyncHandler(controller.postChangeDocumentVersionDetails)
	);

router
	.route('/decision/check-and-confirm/:folderId')
	.get(validateCaseFolderId, asyncHandler(controller.getDecisionCheckAndConfirm))
	.post(
		validateCaseFolderId,
		validatePostDecisionConfirmation,
		asyncHandler(controller.postDecisionCheckAndConfirm)
	);

router
	.route('/:costsCategory/check-and-confirm/:folderId/:documentId')
	.get(validateCaseFolderId, asyncHandler(controller.getAddDocumentsCheckAndConfirm))
	.post(validateCaseFolderId, asyncHandler(controller.postAddDocumentVersionCheckAndConfirm));

export default router;
