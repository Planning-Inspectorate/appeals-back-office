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
import { validateAddDocumentType } from './costs.validators.js';
import { assertGroupAccess } from '#app/auth/auth.guards.js';

const router = createRouter({ mergeParams: true });

router
	.route('/:costsApplicant/select-document-type/:folderId')
	.get(validateAppeal, asyncRoute(controller.getSelectDocumentType))
	.post(
		validateAppeal,
		validateCaseFolderId,
		validateAddDocumentType,
		asyncRoute(controller.postSelectDocumentType)
	);

router
	.route('/:costsApplicant/upload-documents/:folderId')
	.get(validateAppeal, validateCaseFolderId, asyncRoute(controller.getDocumentUpload));

router
	.route('/:costsApplicant/upload-documents/:folderId/:documentId')
	.get(validateAppeal, validateCaseFolderId, asyncRoute(controller.getDocumentVersionUpload));

router
	.route('/:costsApplicant/add-document-details/:folderId')
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
	.route('/:costsApplicant/manage-documents/:folderId')
	.get(validateAppeal, validateCaseFolderId, asyncRoute(controller.getManageFolder));

router
	.route('/:costsApplicant/manage-documents/:folderId/:documentId')
	.get(validateAppeal, validateCaseFolderId, asyncRoute(controller.getManageDocument));

router
	.route('/:costsApplicant/manage-documents/:folderId/:documentId/:versionId/delete')
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

export default router;
