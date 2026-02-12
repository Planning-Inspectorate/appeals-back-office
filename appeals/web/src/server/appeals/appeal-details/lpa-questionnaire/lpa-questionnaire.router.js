import { assertUserHasPermission } from '#app/auth/auth.guards.js';
import { permissionNames } from '#environment/permissions.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as documentsValidators from '../../appeal-documents/appeal-documents.validators.js';
import { validateAppeal, validateAppealWithInclude } from '../appeal-details.middleware.js';
import * as controller from './lpa-questionnaire.controller.js';
import * as validators from './lpa-questionnaire.validators.js';
import outcomeIncompleteRouter from './outcome-incomplete/outcome-incomplete.router.js';

import { extractAndProcessDocumentDateErrors } from '#lib/validators/date-input.validator.js';
import {
	clearUncommittedFilesFromSession,
	validateCaseDocumentId,
	validateCaseFolderId
} from '../../appeal-documents/appeal-documents.middleware.js';
import changeLpaRouter from '../change-appeal-details/local-planning-authority/local-planning-authority.router.js';
import greenBeltRouter from '../green-belt/green-belt.router.js';
import inspectorAccessRouter from '../inspector-access/inspector-access.router.js';
import neighbouringSitesRouter from '../neighbouring-sites/neighbouring-sites.router.js';
import otherAppealsRouter from '../other-appeals/other-appeals.router.js';
import safetyRisksRouter from '../safety-risks/safety-risks.router.js';
import affectedListedBuildingsRouter from './affected-listed-buildings/affected-listed-buildings.router.js';
import affectsScheduledMonumentRouter from './affects-scheduled-monument/affects-scheduled-monument.router.js';
import allegedBreachCreatesFloorSpaceRouter from './alleged-breach-creates-floor-space/alleged-breach-creates-floor-space.router.js';
import appellantPhotosAndPlansRouter from './appellant-photos-and-plans/appellant-photos-and-plans.router.js';
import changeOfUseMineralExtractionRouter from './change-of-use-mineral-extraction/change-of-use-mineral-extraction.router.js';
import changeOfUseMineralStorageRouter from './change-of-use-mineral-storage/change-of-use-mineral-storage.router.js';
import changeOfUseRefuseOrWasteRouter from './change-of-use-refuse-or-waste/change-of-use-refuse-or-waste.router.js';
import changedListedBuildingsRouter from './changed-listed-buildings/changed-listed-buildings.router.js';
import hasCommunityInfrastructureLevyRouter from './community-infrastructure-levy/has-community-infrastructure-levy/has-community-infrastructure-levy.router.js';
import infrastructureLevyAdoptedDateRouter from './community-infrastructure-levy/infrastructure-levy-adopted-date/infrastructure-levy-adopted-date.router.js';
import infrastructureLevyExpectedDateRouter from './community-infrastructure-levy/infrastructure-levy-expected-date/infrastructure-levy-expected-date.router.js';
import isInfrastructureLevyFormallyAdoptedRouter from './community-infrastructure-levy/is-infrastructure-levy-formally-adopted/is-infrastructure-levy-formally-adopted.router.js';
import correctAppealTypeRouter from './correct-appeal-type/correct-appeal-type.router.js';
import designatedSitesRouter from './designated-sites/designated-sites.router.js';
import eiaDevelopmentDescriptionRouter from './environmental-impact-assessment/eia-development-description/eia-development-description.router.js';
import eiaEnvironmentalImpactScheduleRouter from './environmental-impact-assessment/eia-environmental-impact-schedule/eia-environmental-impact-schedule.router.js';
import environmentalAssessmentRouter from './environmental-impact-assessment/environmental-impact-assessment.router.js';
import extraConditionsRouter from './extra-conditions/extra-conditions.router.js';
import hasAllegedBreachAreaRouter from './has-alleged-breach-area/has-alleged-breach-area.router.js';
import hasProtectedSpeciesRouter from './has-protected-species/has-protected-species.router.js';
import highwayTrafficPublicSafetyRouter from './highway-traffic-public-safety/highway-traffic-public-safety.router.js';
import isAonbNationalLandscapeRouter from './is-aonb-national-landscape/is-aonb-national-landscape.router.js';
import isGypsyOrTravellerSiteRouter from './is-gypsy-or-traveller-site/is-gypsy-or-traveller-site.router.js';
import isOnCrownLandRouter from './is-on-crown-land/is-on-crown-land.router.js';
import appealUnderActSectionRouter from './ldc-type/ldc-type.router.js';
import { validateLpaQuestionnaireId } from './lpa-questionnaire.middleware.js';
import neighbouringSiteAccessRouter from './neighbouring-site-access/neighbouring-site-access.router.js';
import notificationMethodsRouter from './notification-methods/notification-methods.router.js';
import pdRightsRemovedRouter from './pd-rights-removed/pd-rights-removed.router.js';
import preserveGrantLoanRouter from './preserve-grant-loan/preserve-grant-loan.router.js';
import procedurePreferenceRouter from './procedure-preference/procedure-preference.router.js';
import relatesToAgriculturalPurposeRouter from './relates-to-agricultural-purpose/relates-to-agricultural-purpose.router.js';
import relatesToErectionOfBuildingsRouter from './relates-to-erection-buildings/relates-to-erection-buildings.router.js';
import relatesToOperationsRouter from './relates-to-operations/relates-to-operations.router.js';
import singleDwellingHouseRouter from './single-dwelling-house/single-dwelling-house.router.js';
import siteAreaRouter from './site-area/site-area.router.js';
import specialControlOfAdvertisementRouter from './special-control-of-advertisement/special-control-of-advertisement.router.js';
import trunkRoadRouter from './trunk-road/trunk-road.router.js';

const router = createRouter({ mergeParams: true });
router.param('lpaQuestionnaireId', (req, res, next) => {
	validateLpaQuestionnaireId(req, res, next);
});

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
	'/:lpaQuestionnaireId/changed-listed-buildings',
	validateAppeal,
	assertUserHasPermission(permissionNames.updateCase),
	changedListedBuildingsRouter
);

router.use(
	'/:lpaQuestionnaireId/environmental-impact-assessment',
	validateAppeal,
	assertUserHasPermission(permissionNames.updateCase),
	environmentalAssessmentRouter
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
	'/:lpaQuestionnaireId/has-community-infrastructure-levy',
	validateAppeal,
	assertUserHasPermission(permissionNames.updateCase),
	hasCommunityInfrastructureLevyRouter
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

router.use(
	'/:lpaQuestionnaireId/eia-environmental-impact-schedule',
	validateAppeal,
	assertUserHasPermission(permissionNames.updateCase),
	eiaEnvironmentalImpactScheduleRouter
);

router.use(
	'/:lpaQuestionnaireId/eia-development-description',
	validateAppeal,
	assertUserHasPermission(permissionNames.updateCase),
	eiaDevelopmentDescriptionRouter
);

router.use(
	'/:lpaQuestionnaireId/procedure-preference',
	validateAppeal,
	assertUserHasPermission(permissionNames.updateCase),
	procedurePreferenceRouter
);

router.use(
	'/:lpaQuestionnaireId/neighbouring-site-access',
	validateAppeal,
	assertUserHasPermission(permissionNames.updateCase),
	neighbouringSiteAccessRouter
);

router.use(
	'/:lpaQuestionnaireId/in-near-or-likely-to-affect-designated-sites',
	validateAppeal,
	assertUserHasPermission(permissionNames.updateCase),
	designatedSitesRouter
);

router.use(
	'/:lpaQuestionnaireId/change-appeal-details/local-planning-authority',
	validateAppeal,
	assertUserHasPermission(permissionNames.updateCase),
	changeLpaRouter
);
router.use(
	'/:lpaQuestionnaireId/preserve-grant-loan',
	validateAppeal,
	assertUserHasPermission(permissionNames.updateCase),
	preserveGrantLoanRouter
);
router.use(
	'/:lpaQuestionnaireId/area-special-control',
	validateAppeal,
	assertUserHasPermission(permissionNames.updateCase),
	specialControlOfAdvertisementRouter
);
router.use(
	'/:lpaQuestionnaireId/accurate-photographs-plans',
	validateAppeal,
	assertUserHasPermission(permissionNames.updateCase),
	appellantPhotosAndPlansRouter
);

router.use(
	'/:lpaQuestionnaireId/public-safety',
	validateAppeal,
	assertUserHasPermission(permissionNames.updateCase),
	highwayTrafficPublicSafetyRouter
);

router
	.route('/:lpaQuestionnaireId')
	.get(
		validateAppeal,
		clearUncommittedFilesFromSession,
		asyncHandler(controller.getLpaQuestionnaire)
	)
	.post(
		validateAppeal,
		assertUserHasPermission(permissionNames.updateCase),
		validators.validateReviewOutcome,
		asyncHandler(controller.postLpaQuestionnaire)
	);

router
	.route('/:lpaQuestionnaireId/environment-service-team-review-case')
	.get(validateAppeal, asyncHandler(controller.getEnvironmentServiceTeamReviewCase))
	.post(
		validateAppeal,
		assertUserHasPermission(permissionNames.updateCase),
		validators.validateEiaScreeningRequired,
		asyncHandler(controller.postEnvironmentServiceTeamReviewCase)
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
		extractAndProcessDocumentDateErrors(),
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
		extractAndProcessDocumentDateErrors(),
		asyncHandler(controller.postDocumentVersionDetails)
	);

router
	.route('/:lpaQuestionnaireId/manage-documents/:folderId/')
	.get(
		validateAppealWithInclude(['appealType']),
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
		extractAndProcessDocumentDateErrors(),
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
		extractAndProcessDocumentDateErrors(),
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

router.use(
	'/:lpaQuestionnaireId/relates-to-operations',
	validateAppealWithInclude(['lpaQuestionnaire']),
	assertUserHasPermission(permissionNames.updateCase),
	relatesToOperationsRouter
);

router.use(
	'/:lpaQuestionnaireId/has-alleged-breach-area',
	validateAppealWithInclude(['lpaQuestionnaire']),
	assertUserHasPermission(permissionNames.updateCase),
	hasAllegedBreachAreaRouter
);

router.use(
	'/:lpaQuestionnaireId/alleged-breach-creates-floor-space',
	validateAppealWithInclude(['lpaQuestionnaire']),
	assertUserHasPermission(permissionNames.updateCase),
	allegedBreachCreatesFloorSpaceRouter
);

router.use(
	'/:lpaQuestionnaireId/pd-rights-removed',
	validateAppealWithInclude(['lpaQuestionnaire']),
	assertUserHasPermission(permissionNames.updateCase),
	pdRightsRemovedRouter
);

router.use(
	'/:lpaQuestionnaireId/erection-buildings',
	validateAppealWithInclude(['lpaQuestionnaire']),
	assertUserHasPermission(permissionNames.updateCase),
	relatesToErectionOfBuildingsRouter
);

router.use(
	'/:lpaQuestionnaireId/agricultural-purpose',
	validateAppealWithInclude(['lpaQuestionnaire']),
	assertUserHasPermission(permissionNames.updateCase),
	relatesToAgriculturalPurposeRouter
);

router.use(
	'/:lpaQuestionnaireId/change-of-use-refuse-or-waste',
	validateAppealWithInclude(['lpaQuestionnaire']),
	assertUserHasPermission(permissionNames.updateCase),
	changeOfUseRefuseOrWasteRouter
);

router.use(
	'/:lpaQuestionnaireId/change-of-use-mineral-extraction',
	validateAppealWithInclude(['lpaQuestionnaire']),
	assertUserHasPermission(permissionNames.updateCase),
	changeOfUseMineralExtractionRouter
);

router.use(
	'/:lpaQuestionnaireId/change-of-use-mineral-storage',
	validateAppealWithInclude(['lpaQuestionnaire']),
	assertUserHasPermission(permissionNames.updateCase),
	changeOfUseMineralStorageRouter
);

router.use(
	'/:lpaQuestionnaireId/single-dwelling-house',
	validateAppealWithInclude(['lpaQuestionnaire']),
	assertUserHasPermission(permissionNames.updateCase),
	singleDwellingHouseRouter
);

router.use(
	'/:lpaQuestionnaireId/is-on-crown-land',
	validateAppealWithInclude(['lpaQuestionnaire']),
	assertUserHasPermission(permissionNames.updateCase),
	isOnCrownLandRouter
);

router.use(
	'/:lpaQuestionnaireId/trunk-road',
	validateAppealWithInclude(['lpaQuestionnaire']),
	assertUserHasPermission(permissionNames.updateCase),
	trunkRoadRouter
);

router.use(
	'/:lpaQuestionnaireId/site-area',
	validateAppealWithInclude(['lpaQuestionnaire']),
	assertUserHasPermission(permissionNames.updateCase),
	siteAreaRouter
);

router.use(
	'/:lpaQuestionnaireId/appeal-under-act-section',
	validateAppealWithInclude(['lpaQuestionnaire']),
	assertUserHasPermission(permissionNames.updateCase),
	appealUnderActSectionRouter
);

export default router;
