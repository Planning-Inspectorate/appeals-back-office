import { Router as createRouter } from 'express';
import config from '#environment/config.js';
import asyncRoute from '#lib/async-route.js';
import * as controller from './lpa-questionnaire.controller.js';
import * as validators from './lpa-questionnaire.validators.js';
import * as documentsValidators from '../../appeal-documents/appeal-documents.validators.js';
import outcomeIncompleteRouter from './outcome-incomplete/outcome-incomplete.router.js';
import { assertGroupAccess } from '../../../app/auth/auth.guards.js';
import { validateAppeal } from '../appeal-details.middleware.js';
import { assertUserHasPermission } from '#app/auth/auth.guards.js';
import { permissionNames } from '#environment/permissions.js';

import {
	validateCaseFolderId,
	validateCaseDocumentId
} from '../../appeal-documents/appeal-documents.middleware.js';
import changePageRouter from '../../change-page/change-page.router.js';
import changeInspectorAccessRouter from '../inspector-access/inspector-access.router.js';
import neighbouringSitesRouter from '../neighbouring-sites/neighbouring-sites.router.js';
import safetyRisksRouter from '../safety-risks/safety-risks.router.js';
import correctAppealTypeRouter from '../correct-appeal-type/correct-appeal-type.router.js';
import otherAppealsRouter from '../other-appeals/other-appeals.router.js';

const router = createRouter({ mergeParams: true });

router.use(
	'/:lpaQuestionnaireId/neighbouring-sites',
	validateAppeal,
	assertUserHasPermission(permissionNames.updateCase),
	neighbouringSitesRouter
);
router.use(
	'/:lpaQuestionnaireId/incomplete',
	validateAppeal,
	assertUserHasPermission(permissionNames.updateCase),
	outcomeIncompleteRouter
);
router.use(
	'/:lpaQuestionnaireId/change-lpa-questionnaire',
	validateAppeal,
	assertUserHasPermission(permissionNames.updateCase),
	changePageRouter
);
router.use(
	'/:lpaQuestionnaireId/inspector-access',
	validateAppeal,
	assertUserHasPermission(permissionNames.updateCase),
	changeInspectorAccessRouter
);
router.use(
	'/:lpaQuestionnaireId/safety-risks',
	validateAppeal,
	assertUserHasPermission(permissionNames.updateCase),
	safetyRisksRouter
);
router.use(
	'/:lpaQuestionnaireId/is-correct-appeal-type',
	validateAppeal,
	assertUserHasPermission(permissionNames.updateCase),
	correctAppealTypeRouter
);
router.use(
	'/:lpaQuestionnaireId/other-appeals',
	validateAppeal,
	assertUserHasPermission(permissionNames.updateCase),
	otherAppealsRouter
);

router
	.route('/:lpaQuestionnaireId')
	.get(validateAppeal, asyncRoute(controller.getLpaQuestionnaire))
	.post(
		validateAppeal,
		assertUserHasPermission(permissionNames.updateCase),
		validators.validateReviewOutcome,
		assertGroupAccess(config.referenceData.appeals.caseOfficerGroupId),
		asyncRoute(controller.postLpaQuestionnaire)
	);
router
	.route('/:lpaQuestionnaireId/check-your-answers')
	.get(
		validateAppeal,
		assertUserHasPermission(permissionNames.updateCase),
		asyncRoute(controller.getCheckAndConfirm)
	)
	.post(
		validateAppeal,
		assertUserHasPermission(permissionNames.updateCase),
		assertGroupAccess(config.referenceData.appeals.caseOfficerGroupId),
		asyncRoute(controller.postCheckAndConfirm)
	);

router
	.route('/:lpaQuestionnaireId/confirmation')
	.get(
		validateAppeal,
		assertUserHasPermission(permissionNames.updateCase),
		asyncRoute(controller.getConfirmation)
	);

router
	.route('/:lpaQuestionnaireId/add-documents/:folderId')
	.get(
		validateAppeal,
		assertUserHasPermission(permissionNames.updateCase),
		validateCaseFolderId,
		validateCaseDocumentId,
		asyncRoute(controller.getAddDocuments)
	)
	.post(validateAppeal, validateCaseFolderId, asyncRoute(controller.postAddDocuments));

router
	.route('/:lpaQuestionnaireId/add-documents/:folderId/check-your-answers')
	.get(validateAppeal, validateCaseFolderId, asyncRoute(controller.getAddDocumentsCheckAndConfirm))
	.post(
		validateAppeal,
		validateCaseFolderId,
		asyncRoute(controller.postAddDocumentsCheckAndConfirm)
	);

router
	.route('/:lpaQuestionnaireId/add-documents/:folderId/:documentId')
	.get(
		validateAppeal,
		assertUserHasPermission(permissionNames.updateCase),
		validateCaseFolderId,
		validateCaseDocumentId,
		asyncRoute(controller.getAddDocumentVersion)
	)
	.post(validateAppeal, validateCaseFolderId, asyncRoute(controller.postAddDocumentVersion));

router
	.route('/:lpaQuestionnaireId/add-documents/:folderId/:documentId/check-your-answers')
	.get(validateAppeal, validateCaseFolderId, asyncRoute(controller.getAddDocumentsCheckAndConfirm))
	.post(
		validateAppeal,
		validateCaseFolderId,
		asyncRoute(controller.postAddDocumentVersionCheckAndConfirm)
	);

router
	.route('/:lpaQuestionnaireId/add-document-details/:folderId')
	.get(
		validateAppeal,
		assertUserHasPermission(permissionNames.updateCase),
		validateCaseFolderId,
		asyncRoute(controller.getAddDocumentDetails)
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
		asyncRoute(controller.postAddDocumentDetails)
	);

router
	.route('/:lpaQuestionnaireId/add-document-details/:folderId/:documentId')
	.get(
		validateAppeal,
		assertUserHasPermission(permissionNames.updateCase),
		validateCaseFolderId,
		asyncRoute(controller.getAddDocumentVersionDetails)
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
		asyncRoute(controller.postDocumentVersionDetails)
	);

router
	.route('/:lpaQuestionnaireId/manage-documents/:folderId/')
	.get(
		assertUserHasPermission(permissionNames.updateCase),
		validateCaseFolderId,
		asyncRoute(controller.getManageFolder)
	);

router
	.route('/:lpaQuestionnaireId/manage-documents/:folderId/:documentId')
	.get(
		validateAppeal,
		assertUserHasPermission(permissionNames.updateCase),
		validateCaseFolderId,
		validateCaseDocumentId,
		asyncRoute(controller.getManageDocument)
	)
	.post(
		validateAppeal,
		assertUserHasPermission(permissionNames.updateCase),
		validateCaseFolderId,
		validateCaseDocumentId,
		asyncRoute(controller.postAddDocumentDetails)
	);

router
	.route('/:lpaQuestionnaireId/change-document-details/:folderId/:documentId')
	.get(
		validateAppeal,
		assertUserHasPermission(permissionNames.updateCase),
		validateCaseFolderId,
		asyncRoute(controller.getChangeDocumentVersionDetails)
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
		asyncRoute(controller.postChangeDocumentVersionDetails)
	);

router
	.route('/:lpaQuestionnaireId/manage-documents/:folderId/:documentId/:versionId/delete')
	.get(
		validateAppeal,
		assertUserHasPermission(permissionNames.updateCase),
		validateCaseFolderId,
		validateCaseDocumentId,
		asyncRoute(controller.getDeleteDocument)
	)
	.post(
		validateAppeal,
		assertUserHasPermission(permissionNames.updateCase),
		validateCaseFolderId,
		validateCaseDocumentId,
		documentsValidators.validateDocumentDeleteAnswer,
		asyncRoute(controller.postDeleteDocumentPage)
	);

export default router;
