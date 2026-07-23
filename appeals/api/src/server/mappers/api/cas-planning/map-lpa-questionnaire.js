/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Api.LpaQuestionnaire} LpaQuestionnaire */
/** @typedef {import('#mappers/mapper-factory.js').MappingRequest} MappingRequest */

import { formatListedBuildingDetails } from '#utils/format-listed-building.js';
import formatValidationOutcomeResponse from '#utils/format-validation-outcome-response.js';
import { beforeExpeditedOriginalApplicationCutOff } from '@pins/appeals/utils/appeal-type-checks.js';

/**
 *
 * @param {MappingRequest} data
 * @returns {LpaQuestionnaire|undefined}
 */
export const mapCasPlanningLpaQuestionnaire = (data) => {
	const {
		appeal: { lpaQuestionnaire, appellantCase }
	} = data;

	if (lpaQuestionnaire) {
		const lPAQuestionnaire = {
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
			}
		};
		return !beforeExpeditedOriginalApplicationCutOff(appellantCase?.applicationDate)
			? {
					...lPAQuestionnaire,
					listOfDocumentsBeforeDecision: lpaQuestionnaire?.listOfDocumentsBeforeDecision || null,
					anySignificantChangesLpa: lpaQuestionnaire?.anySignificantChangesLpa || null,
					anySignificantChangesLpa_localPlanSignificantChanges:
						lpaQuestionnaire?.anySignificantChangesLpa_localPlanSignificantChanges || null,
					anySignificantChangesLpa_nationalPolicySignificantChanges:
						lpaQuestionnaire?.anySignificantChangesLpa_nationalPolicySignificantChanges || null,
					anySignificantChangesLpa_otherSignificantChanges:
						lpaQuestionnaire?.anySignificantChangesLpa_otherSignificantChanges || null,
					anySignificantChangesLpa_courtJudgementSignificantChanges:
						lpaQuestionnaire?.anySignificantChangesLpa_courtJudgementSignificantChanges || null
				}
			: lPAQuestionnaire;
	}
};
