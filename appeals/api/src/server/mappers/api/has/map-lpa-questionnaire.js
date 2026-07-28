/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Api.LpaQuestionnaire} LpaQuestionnaire */
/** @typedef {import('#mappers/mapper-factory.js').MappingRequest} MappingRequest */
import { formatListedBuildingDetails } from '#utils/format-listed-building.js';
import formatValidationOutcomeResponse from '#utils/format-validation-outcome-response.js';

/**
 *
 * @param {MappingRequest} data
 * @returns {LpaQuestionnaire|undefined}
 */
export const mapHasLpaQuestionnaire = (data) => {
	const {
		appeal: { lpaQuestionnaire }
	} = data;

	if (lpaQuestionnaire) {
		return {
			lpaQuestionnaireId: lpaQuestionnaire.id,
			isCorrectAppealType: lpaQuestionnaire.isCorrectAppealType,
			submittedAt: lpaQuestionnaire.lpaQuestionnaireSubmittedDate?.toISOString(),
			receivedAt: lpaQuestionnaire.lpaqCreatedDate?.toISOString(),
			validation:
				formatValidationOutcomeResponse(
					lpaQuestionnaire.lpaQuestionnaireValidationOutcome?.name ?? null,
					lpaQuestionnaire.lpaQuestionnaireIncompleteReasonsSelected
				) ?? undefined,
			lpaNotificationMethods: lpaQuestionnaire.lpaNotificationMethods?.map(
				({ lpaNotificationMethod: { name } }) => ({ name })
			),
			listedBuildingDetails:
				formatListedBuildingDetails(lpaQuestionnaire.listedBuildingDetails) || undefined,
			isConservationArea: lpaQuestionnaire.inConservationArea,
			isGreenBelt: lpaQuestionnaire.isGreenBelt,
			extraConditions: lpaQuestionnaire.newConditionDetails,
			hasExtraConditions: lpaQuestionnaire.newConditionDetails !== null,
			costsAppliedFor: lpaQuestionnaire.lpaCostsAppliedFor,
			siteAccessRequired: {
				details: lpaQuestionnaire?.siteAccessDetails,
				isRequired: lpaQuestionnaire?.siteAccessDetails !== null
			},
			healthAndSafety: {
				details: lpaQuestionnaire?.siteSafetyDetails,
				hasIssues: lpaQuestionnaire?.siteSafetyDetails !== null
			},
			...(lpaQuestionnaire.listOfDocumentsBeforeDecision !== null && {
				listOfDocumentsBeforeDecision: lpaQuestionnaire.listOfDocumentsBeforeDecision
			}),
			...(lpaQuestionnaire.anySignificantChangesLpa !== null && {
				anySignificantChangesLpa: lpaQuestionnaire.anySignificantChangesLpa,
				anySignificantChangesLpa_localPlanSignificantChanges:
					lpaQuestionnaire.anySignificantChangesLpa_localPlanSignificantChanges,
				anySignificantChangesLpa_nationalPolicySignificantChanges:
					lpaQuestionnaire.anySignificantChangesLpa_nationalPolicySignificantChanges,
				anySignificantChangesLpa_otherSignificantChanges:
					lpaQuestionnaire.anySignificantChangesLpa_otherSignificantChanges,
				anySignificantChangesLpa_courtJudgementSignificantChanges:
					lpaQuestionnaire.anySignificantChangesLpa_courtJudgementSignificantChanges
			})
		};
	}
};
