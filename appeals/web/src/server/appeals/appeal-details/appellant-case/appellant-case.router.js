import { Router as createRouter } from 'express';
import config from '#environment/config.js';
import asyncRoute from '#lib/async-route.js';
import * as controller from './appellant-case.controller.js';
import * as validators from './appellant-case.validators.js';
import * as documentsValidators from '../../appeal-documents/appeal-documents.validators.js';
import outcomeValidRouter from './outcome-valid/outcome-valid.router.js';
import outcomeInvalidRouter from './outcome-invalid/outcome-invalid.router.js';
import outcomeIncompleteRouter from './outcome-incomplete/outcome-incomplete.router.js';
import { assertGroupAccess } from '#app/auth/auth.guards.js';
import { validateAppeal } from '../appeal-details.middleware.js';
import {
	validateCaseFolderId,
	validateCaseDocumentId
} from '../../appeal-documents/appeal-documents.middleware.js';
import changeLpaReferenceRouter from '../change-lpa-reference/change-lpa-reference.router.js';
import inspectorAccessRouter from '../inspector-access/inspector-access.router.js';
import serviceUserRouter from '../service-user/service-user.router.js';
import safetyRisksRouter from '../safety-risks/safety-risks.router.js';
import siteAddressRouter from '../address/address.router.js';

const router = createRouter({ mergeParams: true });

router.use('/valid', outcomeValidRouter);
router.use('/invalid', outcomeInvalidRouter);
router.use('/incomplete', outcomeIncompleteRouter);
router.use('/lpa-reference', changeLpaReferenceRouter);
router.use('/inspector-access', inspectorAccessRouter);
router.use('/safety-risks', safetyRisksRouter);
router.use('/service-user', serviceUserRouter);
router.use('/site-address', siteAddressRouter);

router
	.route('/')
	.get(validateAppeal, asyncRoute(controller.getAppellantCase))
	.post(
		validateAppeal,
		validators.validateReviewOutcome,
		assertGroupAccess(config.referenceData.appeals.caseOfficerGroupId),
		asyncRoute(controller.postAppellantCase)
	);

router
	.route('/check-your-answers')
	.get(validateAppeal, asyncRoute(controller.getCheckAndConfirm))
	.post(
		validateAppeal,
		assertGroupAccess(config.referenceData.appeals.caseOfficerGroupId),
		asyncRoute(controller.postCheckAndConfirm)
	);

router
	.route('/add-documents/:folderId')
	.get(
		validateAppeal,
		validateCaseFolderId,
		validateCaseDocumentId,
		asyncRoute(controller.getAddDocuments)
	);

router
	.route('/add-documents/:folderId/:documentId')
	.get(
		validateAppeal,
		validateCaseFolderId,
		validateCaseDocumentId,
		asyncRoute(controller.getAddDocumentsVersion)
	);

router
	.route('/add-document-details/:folderId')
	.get(validateAppeal, validateCaseFolderId, asyncRoute(controller.getAddDocumentDetails))
	.post(
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
	.route('/add-document-details/:folderId/:documentId')
	.get(validateAppeal, validateCaseFolderId, asyncRoute(controller.getAddDocumentVersionDetails))
	.post(
		validateCaseFolderId,
		documentsValidators.validateDocumentDetailsBodyFormat,
		documentsValidators.validateDocumentDetailsReceivedDatesFields,
		documentsValidators.validateDocumentDetailsReceivedDateValid,
		documentsValidators.validateDocumentDetailsReceivedDateIsNotFutureDate,
		documentsValidators.validateDocumentDetailsRedactionStatuses,
		assertGroupAccess(config.referenceData.appeals.caseOfficerGroupId),
		asyncRoute(controller.postDocumentVersionDetails)
	);

router
	.route('/manage-documents/:folderId/')
	.get(validateCaseFolderId, asyncRoute(controller.getManageFolder));

router
	.route('/manage-documents/:folderId/:documentId')
	.get(validateCaseFolderId, validateCaseDocumentId, asyncRoute(controller.getManageDocument));

router
	.route('/change-document-details/:folderId/:documentId')
	.get(validateCaseFolderId, asyncRoute(controller.getChangeDocumentVersionDetails))
	.post(
		validateCaseFolderId,
		documentsValidators.validateDocumentDetailsBodyFormat,
		documentsValidators.validateDocumentDetailsReceivedDatesFields,
		documentsValidators.validateDocumentDetailsReceivedDateValid,
		documentsValidators.validateDocumentDetailsReceivedDateIsNotFutureDate,
		documentsValidators.validateDocumentDetailsRedactionStatuses,
		assertGroupAccess(config.referenceData.appeals.caseOfficerGroupId),
		asyncRoute(controller.postChangeDocumentVersionDetails)
	);

router
	.route('/manage-documents/:folderId/:documentId/:versionId/delete')
	.get(validateCaseFolderId, validateCaseDocumentId, asyncRoute(controller.getDeleteDocument))
	.post(
		validateCaseFolderId,
		validateCaseDocumentId,
		documentsValidators.validateDocumentDeleteAnswer,
		asyncRoute(controller.postDeleteDocument)
	);

export default router;
