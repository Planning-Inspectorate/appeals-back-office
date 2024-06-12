import formatValidationOutcomeResponse from '#utils/format-validation-outcome-response.js';
import { formatAppellantCase } from '#endpoints/appellant-cases/appellant-cases.formatter.js';

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Appeals.SingleLPAQuestionnaireResponse} SingleLPAQuestionnaireResponse */
/** @typedef {import('@pins/appeals.api').Appeals.SingleAppellantCaseResponse} SingleAppellantCaseResponse */

/**
 * @param {Appeal} appeal
 * @returns {SingleLPAQuestionnaireResponse}
 */
export const baseExpectedLPAQuestionnaireResponse = (appeal) => ({
	affectsListedBuildingDetails: appeal.lpaQuestionnaire?.listedBuildingDetails
		? [
				{
					listEntry: appeal.lpaQuestionnaire?.listedBuildingDetails[1].listEntry
				}
		  ]
		: null,
	appealId: appeal.id,
	appealReference: appeal.reference,
	appealSite: {
		addressLine1: '96 The Avenue',
		addressLine2: 'Leftfield',
		county: 'Kent',
		postCode: 'MD21 5XY',
		town: 'Maidstone'
	},
	communityInfrastructureLevyAdoptionDate:
		appeal.lpaQuestionnaire?.communityInfrastructureLevyAdoptionDate,
	developmentDescription: appeal.lpaQuestionnaire?.developmentDescription,
	documents: {
		whoNotified: {},
		conservationMap: {},
		lpaCaseCorrespondence: {},
		otherPartyRepresentations: {},
		planningOfficerReport: {}
	},
	doesAffectAListedBuilding: appeal.lpaQuestionnaire?.doesAffectAListedBuilding,
	doesAffectAScheduledMonument: appeal.lpaQuestionnaire?.doesAffectAScheduledMonument,
	doesSiteHaveHealthAndSafetyIssues: appeal.lpaQuestionnaire?.doesSiteHaveHealthAndSafetyIssues,
	doesSiteRequireInspectorAccess: appeal.lpaQuestionnaire?.doesSiteRequireInspectorAccess,
	extraConditions: appeal.lpaQuestionnaire?.extraConditions,
	hasCommunityInfrastructureLevy: appeal.lpaQuestionnaire?.hasCommunityInfrastructureLevy,
	hasCompletedAnEnvironmentalStatement:
		appeal.lpaQuestionnaire?.hasCompletedAnEnvironmentalStatement,
	hasEmergingPlan: appeal.lpaQuestionnaire?.hasEmergingPlan,
	hasExtraConditions: appeal.lpaQuestionnaire?.hasExtraConditions,
	hasProtectedSpecies: appeal.lpaQuestionnaire?.hasProtectedSpecies,
	hasRepresentationsFromOtherParties: appeal.lpaQuestionnaire?.hasRepresentationsFromOtherParties,
	hasResponsesOrStandingAdviceToUpload:
		appeal.lpaQuestionnaire?.hasResponsesOrStandingAdviceToUpload,
	hasStatementOfCase: appeal.lpaQuestionnaire?.hasStatementOfCase,
	hasStatutoryConsultees: appeal.lpaQuestionnaire?.hasStatutoryConsultees,
	hasSupplementaryPlanningDocuments: appeal.lpaQuestionnaire?.hasSupplementaryPlanningDocuments,
	hasTreePreservationOrder: appeal.lpaQuestionnaire?.hasTreePreservationOrder,
	healthAndSafetyDetails: appeal.lpaQuestionnaire?.healthAndSafetyDetails,
	inCAOrrelatesToCA: appeal.lpaQuestionnaire?.inCAOrrelatesToCA,
	includesScreeningOption: appeal.lpaQuestionnaire?.includesScreeningOption,
	inspectorAccessDetails: appeal.lpaQuestionnaire?.inspectorAccessDetails,
	isAffectingNeighbouringSites: appeal.lpaQuestionnaire?.isAffectingNeighbouringSites,
	isCommunityInfrastructureLevyFormallyAdopted:
		appeal.lpaQuestionnaire?.isCommunityInfrastructureLevyFormallyAdopted,
	isConservationArea: appeal.lpaQuestionnaire?.isConservationArea || null,
	isCorrectAppealType: appeal.lpaQuestionnaire?.isCorrectAppealType || null,
	isEnvironmentalStatementRequired: appeal.lpaQuestionnaire?.isEnvironmentalStatementRequired,
	isGypsyOrTravellerSite: appeal.lpaQuestionnaire?.isGypsyOrTravellerSite,
	isListedBuilding: appeal.lpaQuestionnaire?.isListedBuilding,
	isPublicRightOfWay: appeal.lpaQuestionnaire?.isPublicRightOfWay,
	isSensitiveArea: appeal.lpaQuestionnaire?.isSensitiveArea,
	isSiteVisible: appeal.lpaQuestionnaire?.isSiteVisible,
	isTheSiteWithinAnAONB: appeal.lpaQuestionnaire?.isTheSiteWithinAnAONB,
	listedBuildingDetails: appeal.lpaQuestionnaire?.listedBuildingDetails
		? [
				{
					listEntry: appeal.lpaQuestionnaire?.listedBuildingDetails[0].listEntry
				}
		  ]
		: null,
	localPlanningDepartment: appeal.lpa.name,
	lpaNotificationMethods: appeal.lpaQuestionnaire?.lpaNotificationMethods?.map(
		({ lpaNotificationMethod: { name } }) => ({ name })
	),
	lpaQuestionnaireId: appeal.lpaQuestionnaire?.id,
	meetsOrExceedsThresholdOrCriteriaInColumn2:
		appeal.lpaQuestionnaire?.meetsOrExceedsThresholdOrCriteriaInColumn2,
	procedureType: appeal?.procedureType?.name,
	receivedAt: appeal.lpaQuestionnaire?.receivedAt || new Date(),
	siteWithinGreenBelt: appeal.lpaQuestionnaire?.siteWithinGreenBelt,
	otherAppeals: [],
	validation: formatValidationOutcomeResponse(
		// @ts-ignore
		appeal.lpaQuestionnaire?.lpaQuestionnaireValidationOutcome?.name,
		appeal.lpaQuestionnaire?.lpaQuestionnaireIncompleteReasonsSelected
	)
});

/**
 *
 * @param {Appeal} appeal
 * @returns
 */
export const baseExpectedAppellantCaseResponse = (appeal) => {
	return {
		...formatAppellantCase(appeal),
		documents: {
			appellantCaseCorrespondence: {},
			appellantCaseWithdrawalLetter: {},
			appellantStatement: {},
			applicationDecisionLetter: {},
			changedDescription: {},
			originalApplicationForm: {}
		}
	};
}
