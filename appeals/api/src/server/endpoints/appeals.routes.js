import config from '#config/config.js';
import { appealGroundsRoutes } from '#endpoints/appeal-grounds/appeal-grounds.routes.js';
import { appellantCaseEnforcementInvalidReasonsRoutes } from '#endpoints/appellant-case-enforcement-invalid-reasons/appellant-case-enforcement-invalid-reasons.routes.js';
import { appellantCaseEnforcementMissingDocumentsRoutes } from '#endpoints/appellant-case-enforcement-missing-documents/appellant-case-enforcement-missing-documents.routes.js';
import checkAzureAdUserIdHeaderExists from '#middleware/check-azure-ad-user-id-header-exists.js';
import { Router as createRouter } from 'express';
import initNotifyClientAndAddToRequest from '../middleware/init-notify-client-and-add-to-request.js';
import { inquiryRoutes } from './Inquiry/inquiry.routes.js';
import { addressesRoutes } from './addresses/addresses.routes.js';
import { appealAllocationRouter } from './appeal-allocation/appeal-allocation-routes.js';
import { default as appealDetailsRoutes } from './appeal-details/appeal-details.routes.js';
import { appealRule6PartiesRoutes } from './appeal-rule-6-parties/appeal-rule-6-parties.routes.js';
import { appealStatusRoutes } from './appeal-status/appeal-status.routes.js';
import { appealTimetablesRoutes } from './appeal-timetables/appeal-timetables.routes.js';
import { appealTypeRoutes } from './appeal-types/appeal-types.routes.js';
import { appealsRoutes } from './appeals/appeals.routes.js';
import { appellantCaseEnforcementGroundsMismatchFactsRoutes } from './appellant-case-enforcement-grounds-mismatch-facts/appellant-case-enforcement-grounds-mismatch-facts.routes.js';
import { appellantCaseIncompleteReasonsRoutes } from './appellant-case-incomplete-reasons/appellant-case-incomplete-reasons.routes.js';
import { appellantCaseInvalidReasonsRoutes } from './appellant-case-invalid-reasons/appellant-case-invalid-reasons.routes.js';
import { appellantCaseValidationOutcomesRoutes } from './appellant-case-validation-outcomes/appellant-case-validation-outcomes.routes.js';
import { appellantCasesRoutes } from './appellant-cases/appellant-cases.routes.js';
import { auditTrailsRoutes } from './audit-trails/audit-trails.routes.js';
import { businessDaysRoutes } from './business-days/business-days.routes.js';
import { caseNotesRoutes } from './case-notes/case-notes.routes.js';
import { caseTeamRouter } from './case-team/case-team.routes.js';
import { changeAppealTypeRoutes } from './change-appeal-type/change-appeal-type.routes.js';
import { changeProcedureTypeRoutes } from './change-procedure-type/change-procedure-type.routes.js';
import { decisionRoutes } from './decision/decision.routes.js';
import { documentRedactionStatusesRoutes } from './document-redaction-statuses/document-redaction-statuses.routes.js';
import { documentsRoutes } from './documents/documents.routes.js';
import { environmentalImpactAssessmentRoutes } from './environmental-impact-assessment/environmental-impact-assessment.routes.js';
import { groundsRoutes } from './grounds/grounds.routes.js';
import { hearingEstimatesRoutes } from './hearing-estimates/hearing-estimates.routes.js';
import { hearingRoutes } from './hearings/hearing.routes.js';
import { historicEnglandRoutes } from './historic-england/historic-england.routes.js';
import { inquiryEstimatesRoutes } from './inquiry-estimates/inquiry-estimates.routes.js';
import { integrationsRoutes } from './integrations/integrations.routes.js';
import { knowledgeOfOtherLandownersRoutes } from './knowledge-of-other-landowners/knowledge-of-other-landowners.routes.js';
import { linkAppealsRoutes } from './link-appeals/link-appeals.routes.js';
import { linkedAppealsRoutes } from './linkable-appeals/linkable-appeal.routes.js';
import { listedBuildingRoutes } from './listed-buildings/listed-buildings.routes.js';
import { localPlanningAuthoritiesRoutes } from './local-planning-authorities/local-planning-authorities.routes.js';
import { lpaDesignatedSitesRoutes } from './lpa-designated-sites/lpa-designated-sites.routes.js';
import { lpaNotificationMethodsRoutes } from './lpa-notification-methods/lpa-notification-methods.routes.js';
import { lpaQuestionnaireIncompleteReasonsRoutes } from './lpa-questionnaire-incomplete-reasons/lpa-questionnaire-incomplete-reasons.routes.js';
import { lpaQuestionnaireValidationOutcomesRoutes } from './lpa-questionnaire-validation-outcomes/lpa-questionnaire-validation-outcomes.routes.js';
import { lpaQuestionnairesRoutes } from './lpa-questionnaires/lpa-questionnaires.routes.js';
import { neighbouringSitesRoutes } from './neighbouring-sites/neighbouring-sites.routes.js';
import { appealNotificationRouter } from './notifications/notifications.routes.js';
import { notifyPreviewRouter } from './notify-preview/notify-preview.routes.js';
import { planningAppealDecisionSuppliersRoutes } from './planning-appeal-decision-suppliers/planning-appeal-decision-suppliers.routes.js';
import { procedureTypesRoutes } from './procedure-types/procedure-types.routes.js';
import { representationRejectionReasonsRoutes } from './representation-rejection-reasons/representation-rejection-reasons.routes.js';
import { representationRoutes } from './representations/representations.routes.js';
import { serviceUserRoutes } from './service-user/service-user.routes.js';
import { siteVisitTypesRoutes } from './site-visit-types/site-visit-types.routes.js';
import { siteVisitRoutes } from './site-visits/site-visits.routes.js';
import { testDataRoutes } from './test-data/test-data.routes.js';
import { testUtilsRoutes } from './test-utils/test-utils.routes.js';
import { transferredAppealsRoutes } from './transferred-appeals/transferred-appeal.routes.js';
import { withdrawalRoutes } from './withdrawal/withdrawal.routes.js';

const router = createRouter();
router.use(caseTeamRouter);
router.use(integrationsRoutes);
router.use(businessDaysRoutes);
router.use(historicEnglandRoutes);

if (config.enableTestEndpoints) {
	router.use(testDataRoutes);
}

router.use('/', checkAzureAdUserIdHeaderExists);
router.use('/', initNotifyClientAndAddToRequest);

router.use(appellantCaseIncompleteReasonsRoutes);
router.use(appealAllocationRouter);
router.use(appellantCaseInvalidReasonsRoutes);
router.use(appellantCaseEnforcementInvalidReasonsRoutes);
router.use(appellantCaseEnforcementMissingDocumentsRoutes);
router.use(appellantCaseEnforcementGroundsMismatchFactsRoutes);
router.use(appellantCaseValidationOutcomesRoutes);
router.use(documentRedactionStatusesRoutes);
router.use(knowledgeOfOtherLandownersRoutes);
router.use(lpaNotificationMethodsRoutes);
router.use(lpaDesignatedSitesRoutes);
router.use(lpaQuestionnaireIncompleteReasonsRoutes);
router.use(lpaQuestionnaireValidationOutcomesRoutes);
router.use(appealTypeRoutes);
router.use(procedureTypesRoutes);
router.use(siteVisitTypesRoutes);
router.use(groundsRoutes);
router.use(representationRejectionReasonsRoutes);
router.use(localPlanningAuthoritiesRoutes);
router.use(planningAppealDecisionSuppliersRoutes);

router.use(appealsRoutes);
router.use(appealDetailsRoutes);
router.use(appealGroundsRoutes);
router.use(decisionRoutes);
router.use(addressesRoutes);
router.use(appealTimetablesRoutes);
router.use(appellantCasesRoutes);
router.use(auditTrailsRoutes);
router.use(documentsRoutes);
router.use(lpaQuestionnairesRoutes);
router.use(siteVisitRoutes);
router.use(changeAppealTypeRoutes);
router.use(linkAppealsRoutes);
router.use(neighbouringSitesRoutes);
router.use(serviceUserRoutes);
router.use(withdrawalRoutes);
router.use(environmentalImpactAssessmentRoutes);
router.use(representationRoutes);
router.use(listedBuildingRoutes);
router.use(caseNotesRoutes);
router.use(appealNotificationRouter);
router.use(hearingRoutes);
router.use(notifyPreviewRouter);

if (config.enableTestEndpoints) {
	router.use(testUtilsRoutes);
}

router.use(linkedAppealsRoutes);
router.use(transferredAppealsRoutes);
router.use(hearingEstimatesRoutes);

router.use(inquiryRoutes);
router.use(inquiryEstimatesRoutes);

router.use(appealStatusRoutes);
router.use(changeProcedureTypeRoutes);

router.use(appealRule6PartiesRoutes);
export { router as appealsRoutes };
