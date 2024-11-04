import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import * as controller from './lpa-questionnaire.controller.js';
import * as validators from './lpa-questionnaire.validators.js';
import * as documentsValidators from '../../appeal-documents/appeal-documents.validators.js';
import outcomeIncompleteRouter from './outcome-incomplete/outcome-incomplete.router.js';
import { validateAppeal } from '../appeal-details.middleware.js';
import { assertUserHasPermission } from '#app/auth/auth.guards.js';
import { permissionNames } from '#environment/permissions.js';

import {
	validateCaseFolderId,
	validateCaseDocumentId
} from '../../appeal-documents/appeal-documents.middleware.js';
import changePageRouter from '../../change-page/change-page.router.js';
import inspectorAccessRouter from '../inspector-access/inspector-access.router.js';
import neighbouringSitesRouter from '../neighbouring-sites/neighbouring-sites.router.js';
import safetyRisksRouter from '../safety-risks/safety-risks.router.js';
import correctAppealTypeRouter from './correct-appeal-type/correct-appeal-type.router.js';
import otherAppealsRouter from '../other-appeals/other-appeals.router.js';
import greenBeltRouter from '../green-belt/green-belt.router.js';
import extraConditionsRouter from './extra-conditions/extra-conditions.router.js';
import notificationMethodsRouter from './notification-methods/notification-methods.router.js';
import affectedListedBuildingsRouter from './affected-listed-buildings/affected-listed-buildings.router.js';
import environmentalImpactAssessmentRouter from './environmental-impact-assessment/environmental-impact-assessment.router.js';
import hasProtectedSpeciesRouter from './has-protected-species/has-protected-species.router.js';
import affectsScheduledMonumentRouter from './affects-scheduled-monument/affects-scheduled-monument.router.js';
import isGypsyOrTravellerSiteRouter from './is-gypsy-or-traveller-site/is-gypsy-or-traveller-site.router.js';
import isAonbNationalLandscapeRouter from './is-aonb-national-landscape/is-aonb-national-landscape.router.js';
import isInfrastructureLevyFormallyAdoptedRouter from './is-infrastructure-levy-formally-adopted/is-infrastructure-levy-formally-adopted.router.js';
import infrastructureLevyAdoptedDateRouter from './infrastructure-levy-adopted-date/infrastructure-levy-adopted-date.router.js';
import infrastructureLevyExpectedDateRouter from './infrastructure-levy-expected-date/infrastructure-levy-expected-date.router.js';

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
	inspectorAccessRouter
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

router.use(
	'/:lpaQuestionnaireId/green-belt',
	validateAppeal,
	assertUserHasPermission(permissionNames.updateCase),
	greenBeltRouter
);

router.use(
	'/:lpaQuestionnaireId/extra-conditions',
	validateAppeal,
	assertUserHasPermission(permissionNames.updateCase),
	extraConditionsRouter
);

router.use(
	'/:lpaQuestionnaireId/notification-methods',
	validateAppeal,
	assertUserHasPermission(permissionNames.updateCase),
	notificationMethodsRouter
);

router.use(
	'/:lpaQuestionnaireId/affected-listed-buildings',
	validateAppeal,
	assertUserHasPermission(permissionNames.updateCase),
	affectedListedBuildingsRouter
);

router.use(
	'/:lpaQuestionnaireId/environmental-impact-assessment',
	validateAppeal,
	assertUserHasPermission(permissionNames.updateCase),
	environmentalImpactAssessmentRouter
);

router.use(
	'/:lpaQuestionnaireId/has-protected-species',
	validateAppeal,
	assertUserHasPermission(permissionNames.updateCase),
	hasProtectedSpeciesRouter
);

router.use(
	'/:lpaQuestionnaireId/affects-scheduled-monument',
	validateAppeal,
	assertUserHasPermission(permissionNames.updateCase),
	affectsScheduledMonumentRouter
);

router.use(
	'/:lpaQuestionnaireId/is-gypsy-or-traveller-site',
	validateAppeal,
	assertUserHasPermission(permissionNames.updateCase),
	isGypsyOrTravellerSiteRouter
);

router.use(
	'/:lpaQuestionnaireId/is-aonb-national-landscape',
	validateAppeal,
	assertUserHasPermission(permissionNames.updateCase),
	isAonbNationalLandscapeRouter
);

router.use(
	'/:lpaQuestionnaireId/is-infrastructure-levy-formally-adopted',
	validateAppeal,
	assertUserHasPermission(permissionNames.updateCase),
	isInfrastructureLevyFormallyAdoptedRouter
);

router.use(
	'/:lpaQuestionnaireId/infrastructure-levy-adopted-date',
	validateAppeal,
	assertUserHasPermission(permissionNames.updateCase),
	infrastructureLevyAdoptedDateRouter
);

router.use(
	'/:lpaQuestionnaireId/infrastructure-levy-expected-date',
	validateAppeal,
	assertUserHasPermission(permissionNames.updateCase),
	infrastructureLevyExpectedDateRouter
);

router
	.route('/:lpaQuestionnaireId')
	.get(validateAppeal, asyncHandler(controller.getLpaQuestionnaire))
	.post(
		validateAppeal,
		assertUserHasPermission(permissionNames.updateCase),
		validators.validateReviewOutcome,
		asyncHandler(controller.postLpaQuestionnaire)
	);
router
	.route('/:lpaQuestionnaireId/check-your-answers')
	.get(
		validateAppeal,
		assertUserHasPermission(permissionNames.updateCase),
		asyncHandler(controller.getCheckAndConfirm)
	)
	.post(
		validateAppeal,
		assertUserHasPermission(permissionNames.updateCase),
		asyncHandler(controller.postCheckAndConfirm)
	);

router
	.route('/:lpaQuestionnaireId/confirmation')
	.get(
		validateAppeal,
		assertUserHasPermission(permissionNames.updateCase),
		asyncHandler(controller.getConfirmation)
	);

router
	.route('/:lpaQuestionnaireId/add-documents/:folderId')
	.get(
		validateAppeal,
		assertUserHasPermission(permissionNames.updateCase),
		validateCaseFolderId,
		validateCaseDocumentId,
		asyncHandler(controller.getAddDocuments)
	)
	.post(validateAppeal, validateCaseFolderId, asyncHandler(controller.postAddDocuments));

router
	.route('/:lpaQuestionnaireId/add-documents/:folderId/check-your-answers')
	.get(
		validateAppeal,
		validateCaseFolderId,
		assertUserHasPermission(permissionNames.updateCase),
		asyncHandler(controller.getAddDocumentsCheckAndConfirm)
	)
	.post(
		validateAppeal,
		validateCaseFolderId,
		assertUserHasPermission(permissionNames.updateCase),
		asyncHandler(controller.postAddDocumentsCheckAndConfirm)
	);

router
	.route('/:lpaQuestionnaireId/add-documents/:folderId/:documentId')
	.get(
		validateAppeal,
		validateCaseFolderId,
		validateCaseDocumentId,
		asyncHandler(controller.getAddDocumentVersion)
	)
	.post(
		validateAppeal,
		validateCaseFolderId,
		assertUserHasPermission(permissionNames.updateCase),
		asyncHandler(controller.postAddDocumentVersion)
	);

router
	.route('/:lpaQuestionnaireId/add-documents/:folderId/:documentId/check-your-answers')
	.get(
		validateAppeal,
		validateCaseFolderId,
		assertUserHasPermission(permissionNames.updateCase),
		asyncHandler(controller.getAddDocumentsCheckAndConfirm)
	)
	.post(
		validateAppeal,
		validateCaseFolderId,
		assertUserHasPermission(permissionNames.updateCase),
		asyncHandler(controller.postAddDocumentVersionCheckAndConfirm)
	);

router
	.route('/:lpaQuestionnaireId/add-document-details/:folderId')
	.get(
		validateAppeal,
		assertUserHasPermission(permissionNames.updateCase),
		validateCaseFolderId,
		asyncHandler(controller.getAddDocumentDetails)
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
		asyncHandler(controller.postAddDocumentDetails)
	);

router
	.route('/:lpaQuestionnaireId/add-document-details/:folderId/:documentId')
	.get(
		validateAppeal,
		assertUserHasPermission(permissionNames.updateCase),
		validateCaseFolderId,
		asyncHandler(controller.getAddDocumentVersionDetails)
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
		asyncHandler(controller.postDocumentVersionDetails)
	);

router
	.route('/:lpaQuestionnaireId/manage-documents/:folderId/')
	.get(
		assertUserHasPermission(permissionNames.viewCaseDetails),
		validateCaseFolderId,
		asyncHandler(controller.getManageFolder)
	);

router
	.route('/:lpaQuestionnaireId/manage-documents/:folderId/:documentId')
	.get(
		validateAppeal,
		assertUserHasPermission(permissionNames.viewCaseDetails),
		validateCaseFolderId,
		validateCaseDocumentId,
		asyncHandler(controller.getManageDocument)
	)
	.post(
		validateAppeal,
		assertUserHasPermission(permissionNames.updateCase),
		validateCaseFolderId,
		validateCaseDocumentId,
		asyncHandler(controller.postAddDocumentDetails)
	);

router
	.route('/:lpaQuestionnaireId/change-document-name/:folderId/:documentId')
	.get(
		validateAppeal,
		assertUserHasPermission(permissionNames.updateCase),
		validateCaseFolderId,
		asyncHandler(controller.getChangeDocumentFileNameDetails)
	)
	.post(
		validateAppeal,
		assertUserHasPermission(permissionNames.updateCase),
		validateCaseFolderId,
		documentsValidators.validateDocumentNameBodyFormat,
		documentsValidators.validateDocumentName,
		asyncHandler(controller.postChangeDocumentFileNameDetails)
	);

router
	.route('/:lpaQuestionnaireId/change-document-details/:folderId/:documentId')
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
		asyncHandler(controller.postChangeDocumentVersionDetails)
	);

router
	.route('/:lpaQuestionnaireId/manage-documents/:folderId/:documentId/:versionId/delete')
	.get(
		validateAppeal,
		assertUserHasPermission(permissionNames.updateCase),
		validateCaseFolderId,
		validateCaseDocumentId,
		asyncHandler(controller.getDeleteDocument)
	)
	.post(
		validateAppeal,
		assertUserHasPermission(permissionNames.updateCase),
		validateCaseFolderId,
		validateCaseDocumentId,
		documentsValidators.validateDocumentDeleteAnswer,
		asyncHandler(controller.postDeleteDocumentPage)
	);

export default router;
