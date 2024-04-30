import { Router as createRouter } from 'express';
import config from '#environment/config.js';
import asyncRoute from '#lib/async-route.js';
import * as controller from './lpa-questionnaire.controller.js';
import * as validators from './lpa-questionnaire.validators.js';
import * as documentsValidators from '../../appeal-documents/appeal-documents.validators.js';
import outcomeIncompleteRouter from './outcome-incomplete/outcome-incomplete.router.js';
import { assertGroupAccess } from '../../../app/auth/auth.guards.js';
import { validateAppeal } from '../appeal-details.middleware.js';
import {
	validateCaseFolderId,
	validateCaseDocumentId
} from '../../appeal-documents/appeal-documents.middleware.js';
import changePageRouter from '../../change-page/change-page.router.js';
import changeInspectorAccessRouter from '../inspector-access/inspector-access.router.js';
import neighbouringSitesRouter from '../neighbouring-sites/neighbouring-sites.router.js';
import safetyRisksRouter from '../safety-risks/safety-risks.router.js';
import correctAppealTypeRouter from '../correct-appeal-type/correct-appeal-type.router.js';

const router = createRouter({ mergeParams: true });

router.use('/:lpaQuestionnaireId/neighbouring-sites', neighbouringSitesRouter);
router.use('/:lpaQuestionnaireId/incomplete', outcomeIncompleteRouter);
router.use('/:lpaQuestionnaireId/change-lpa-questionnaire', changePageRouter);
router.use('/:lpaQuestionnaireId/inspector-access', changeInspectorAccessRouter);
router.use('/:lpaQuestionnaireId/safety-risks', safetyRisksRouter);
router.use('/:lpaQuestionnaireId/is-correct-appeal-type', correctAppealTypeRouter);

router
	.route('/:lpaQuestionnaireId')
	.get(validateAppeal, asyncRoute(controller.getLpaQuestionnaire))
	.post(
		validateAppeal,
		validators.validateReviewOutcome,
		assertGroupAccess(config.referenceData.appeals.caseOfficerGroupId),
		asyncRoute(controller.postLpaQuestionnaire)
	);
router
	.route('/:lpaQuestionnaireId/check-your-answers')
	.get(validateAppeal, asyncRoute(controller.getCheckAndConfirm))
	.post(
		validateAppeal,
		assertGroupAccess(config.referenceData.appeals.caseOfficerGroupId),
		asyncRoute(controller.postCheckAndConfirm)
	);

router
	.route('/:lpaQuestionnaireId/confirmation')
	.get(validateAppeal, asyncRoute(controller.getConfirmation));

router
	.route('/:lpaQuestionnaireId/add-documents/:folderId')
	.get(validateCaseFolderId, validateCaseDocumentId, asyncRoute(controller.getAddDocuments));
router
	.route('/:lpaQuestionnaireId/add-documents/:folderId/:documentId')
	.get(validateCaseFolderId, validateCaseDocumentId, asyncRoute(controller.getAddDocumentsVersion));

router
	.route('/:lpaQuestionnaireId/add-document-details/:folderId')
	.get(validateCaseFolderId, asyncRoute(controller.getAddDocumentDetails))
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
	.route('/:lpaQuestionnaireId/add-document-details/:folderId/:documentId')
	.get(validateCaseFolderId, asyncRoute(controller.getAddDocumentVersionDetails))
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
	.route('/:lpaQuestionnaireId/manage-documents/:folderId/')
	.get(validateCaseFolderId, asyncRoute(controller.getManageFolder));

router
	.route('/:lpaQuestionnaireId/manage-documents/:folderId/:documentId')
	.get(validateCaseFolderId, validateCaseDocumentId, asyncRoute(controller.getManageDocument))
	.post(
		validateCaseFolderId,
		validateCaseDocumentId,
		asyncRoute(controller.postAddDocumentDetails)
	);

router
	.route('/:lpaQuestionnaireId/change-document-details/:folderId/:documentId')
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
	.route('/:lpaQuestionnaireId/manage-documents/:folderId/:documentId/:versionId/delete')
	.get(validateCaseFolderId, validateCaseDocumentId, asyncRoute(controller.getDeleteDocument))
	.post(
		validateCaseFolderId,
		validateCaseDocumentId,
		documentsValidators.validateDocumentDeleteAnswer,
		asyncRoute(controller.postDeleteDocument)
	);

export default router;
