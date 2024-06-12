import { Router as createRouter } from 'express';
import config from '#environment/config.js';
import asyncRoute from '#lib/async-route.js';
import * as controller from './costs.controller.js';
import {
	validateCaseFolderId,
	validateCaseDocumentId
} from '../../appeal-documents/appeal-documents.middleware.js';
import * as documentsValidators from '../../appeal-documents/appeal-documents.validators.js';
import { validateAddDocumentType, validatePostDecisionConfirmation } from './costs.validators.js';
import { assertGroupAccess } from '#app/auth/auth.guards.js';
import { validateAppeal } from '../appeal-details.middleware.js';

const router = createRouter({ mergeParams: true });

router
	.route('/:costsCategory/select-document-type/:folderId')
	.get(asyncRoute(controller.getSelectDocumentType))
	.post(
		validateCaseFolderId,
		validateAddDocumentType,
		asyncRoute(controller.postSelectDocumentType)
	);

router
	.route('/:costsCategory/upload-documents/:folderId')
	.get(validateAppeal, validateCaseFolderId, asyncRoute(controller.getDocumentUpload))
	.post(validateAppeal, validateCaseFolderId, asyncRoute(controller.postDocumentUploadPage));

router
	.route('/:costsCategory/upload-documents/:folderId/:documentId')
	.get(validateAppeal, validateCaseFolderId, asyncRoute(controller.getDocumentVersionUpload))
	.post(validateAppeal, validateCaseFolderId, asyncRoute(controller.postDocumentVersionUpload));

router
	.route([
		'/:costsCategory/add-document-details/:folderId',
		'/:costsCategory/add-document-details/:folderId/:documentId'
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
	.route('/:costsCategory/check-your-answers/:folderId')
	.get(validateAppeal, validateCaseFolderId, asyncRoute(controller.getAddDocumentsCheckAndConfirm))
	.post(
		validateAppeal,
		validateCaseFolderId,
		asyncRoute(controller.postAddDocumentsCheckAndConfirm)
	);

router
	.route('/:costsCategory/check-your-answers/:folderId/:documentId')
	.get(validateAppeal, validateCaseFolderId, asyncRoute(controller.getAddDocumentsCheckAndConfirm))
	.post(
		validateAppeal,
		validateCaseFolderId,
		asyncRoute(controller.postAddDocumentVersionCheckAndConfirm)
	);

router
	.route('/:costsCategory/manage-documents/:folderId')
	.get(validateCaseFolderId, asyncRoute(controller.getManageFolder));

router
	.route('/:costsCategory/manage-documents/:folderId/:documentId')
	.get(validateCaseFolderId, asyncRoute(controller.getManageDocument));

router
	.route('/:costsCategory/manage-documents/:folderId/:documentId/:versionId/delete')
	.get(validateCaseFolderId, validateCaseDocumentId, asyncRoute(controller.getDeleteCostsDocument))
	.post(
		validateCaseFolderId,
		validateCaseDocumentId,
		documentsValidators.validateDocumentDeleteAnswer,
		asyncRoute(controller.postDeleteCostsDocument)
	);

router
	.route('/decision/check-and-confirm/:folderId')
	.get(validateCaseFolderId, asyncRoute(controller.getDecisionCheckAndConfirm))
	.post(
		validateCaseFolderId,
		validatePostDecisionConfirmation,
		asyncRoute(controller.postDecisionCheckAndConfirm)
	);

router
	.route('/decision/check-and-confirm/:folderId/:documentId')
	.get(validateCaseFolderId, asyncRoute(controller.getAddDocumentsCheckAndConfirm))
	.post(
		validateCaseFolderId,
		validatePostDecisionConfirmation,
		asyncRoute(controller.postAddDocumentVersionCheckAndConfirm)
	);

export default router;
