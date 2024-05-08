import { Router as createRouter } from 'express';
import config from '#environment/config.js';
import asyncRoute from '#lib/async-route.js';
import * as controller from './costs.controller.js';
import { validateAppeal } from '../appeal-details.middleware.js';
import {
	validateCaseFolderId,
	validateCaseDocumentId
} from '../../appeal-documents/appeal-documents.middleware.js';
import * as documentsValidators from '../../appeal-documents/appeal-documents.validators.js';
import { validateAddDocumentType, validatePostDecisionConfirmation } from './costs.validators.js';
import { assertGroupAccess } from '#app/auth/auth.guards.js';

const router = createRouter({ mergeParams: true });

router
	.route('/:costsCategory/select-document-type/:folderId')
	.get(validateAppeal, asyncRoute(controller.getSelectDocumentType))
	.post(
		validateAppeal,
		validateCaseFolderId,
		validateAddDocumentType,
		asyncRoute(controller.postSelectDocumentType)
	);

router
	.route('/:costsCategory/upload-documents/:folderId')
	.get(validateAppeal, validateCaseFolderId, asyncRoute(controller.getDocumentUpload));

router
	.route('/:costsCategory/upload-documents/:folderId/:documentId')
	.get(validateAppeal, validateCaseFolderId, asyncRoute(controller.getDocumentVersionUpload));

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
	.route('/:costsCategory/manage-documents/:folderId')
	.get(validateAppeal, validateCaseFolderId, asyncRoute(controller.getManageFolder));

router
	.route('/:costsCategory/manage-documents/:folderId/:documentId')
	.get(validateAppeal, validateCaseFolderId, asyncRoute(controller.getManageDocument));

router
	.route('/:costsCategory/manage-documents/:folderId/:documentId/:versionId/delete')
	.get(
		validateAppeal,
		validateCaseFolderId,
		validateCaseDocumentId,
		asyncRoute(controller.getDeleteCostsDocument)
	)
	.post(
		validateAppeal,
		validateCaseFolderId,
		validateCaseDocumentId,
		documentsValidators.validateDocumentDeleteAnswer,
		asyncRoute(controller.postDeleteCostsDocument)
	);

router
	.route('/decision/check-and-confirm/:folderId')
	.get(validateAppeal, validateCaseFolderId, asyncRoute(controller.getDecisionCheckAndConfirm))
	.post(
		validateAppeal,
		validateCaseFolderId,
		validatePostDecisionConfirmation,
		asyncRoute(controller.postDecisionCheckAndConfirm)
	);

export default router;
