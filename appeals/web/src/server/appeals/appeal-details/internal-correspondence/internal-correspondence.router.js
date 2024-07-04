import { Router as createRouter } from 'express';
import config from '#environment/config.js';
import asyncRoute from '#lib/async-route.js';
import * as controller from './internal-correspondence.controller.js';
import {
	validateCaseFolderId,
	validateCaseDocumentId
} from '../../appeal-documents/appeal-documents.middleware.js';
import { validateAppeal } from '../appeal-details.middleware.js';
import * as documentsValidators from '../../appeal-documents/appeal-documents.validators.js';
import { assertGroupAccess } from '#app/auth/auth.guards.js';

const router = createRouter({ mergeParams: true });

router
	.route('/:correspondenceCategory/upload-documents/:folderId')
	.get(validateAppeal, validateCaseFolderId, asyncRoute(controller.getDocumentUpload))
	.post(validateAppeal, validateCaseFolderId, asyncRoute(controller.postDocumentUploadPage));

router
	.route('/:correspondenceCategory/upload-documents/:folderId/:documentId')
	.get(validateAppeal, validateCaseFolderId, asyncRoute(controller.getDocumentVersionUpload))
	.post(validateAppeal, validateCaseFolderId, asyncRoute(controller.postDocumentVersionUpload));

router
	.route([
		'/:correspondenceCategory/add-document-details/:folderId',
		'/:correspondenceCategory/add-document-details/:folderId/:documentId'
	])
	.get(validateAppeal, validateCaseFolderId, asyncRoute(controller.getAddDocumentDetails))
	.post(
		validateAppeal,
		validateCaseFolderId,
		documentsValidators.validateDocumentDetailsBodyFormat,
		documentsValidators.validateDocumentDetailsReceivedDatesFields,
		documentsValidators.validateDocumentDetailsReceivedDateValid,
		documentsValidators.validateDocumentDetailsReceivedDateIsNotFutureDate,
		documentsValidators.validateDocumentDetailsRedactionStatuses,
		assertGroupAccess(config.referenceData.appeals.caseOfficerGroupId),
		asyncRoute(controller.postAddDocumentDetails)
	);

router
	.route('/:correspondenceCategory/check-your-answers/:folderId')
	.get(validateAppeal, validateCaseFolderId, asyncRoute(controller.getAddDocumentsCheckAndConfirm))
	.post(
		validateAppeal,
		validateCaseFolderId,
		asyncRoute(controller.postAddDocumentsCheckAndConfirm)
	);

router
	.route('/:correspondenceCategory/check-your-answers/:folderId/:documentId')
	.get(validateAppeal, validateCaseFolderId, asyncRoute(controller.getAddDocumentsCheckAndConfirm))
	.post(
		validateAppeal,
		validateCaseFolderId,
		asyncRoute(controller.postAddDocumentVersionCheckAndConfirm)
	);

router
	.route('/:correspondenceCategory/manage-documents/:folderId')
	.get(validateCaseFolderId, asyncRoute(controller.getManageFolder));

router
	.route('/:correspondenceCategory/manage-documents/:folderId/:documentId')
	.get(validateCaseFolderId, asyncRoute(controller.getManageDocument));

router
	.route('/:correspondenceCategory/manage-documents/:folderId/:documentId/:versionId/delete')
	.get(
		validateCaseFolderId,
		validateCaseDocumentId,
		asyncRoute(controller.getDeleteInternalCorrespondenceDocument)
	)
	.post(
		validateCaseFolderId,
		validateCaseDocumentId,
		documentsValidators.validateDocumentDeleteAnswer,
		asyncRoute(controller.postDeleteInternalCorrespondenceDocument)
	);

export default router;
