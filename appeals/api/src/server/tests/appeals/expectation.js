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
	healthAndSafetyDetails: appeal.lpaQuestionnaire?.siteSafetyDetails,
	doesSiteHaveHealthAndSafetyIssues: appeal.lpaQuestionnaire?.siteSafetyDetails !== null,
	inspectorAccessDetails: appeal.lpaQuestionnaire?.siteAccessDetails,
	doesSiteRequireInspectorAccess: appeal.lpaQuestionnaire?.siteAccessDetails !== null,
	isConservationArea: appeal.lpaQuestionnaire?.inConservationArea,
	siteWithinGreenBelt: appeal.lpaQuestionnaire?.siteWithinGreenBelt,
	isCorrectAppealType: appeal.lpaQuestionnaire?.isCorrectAppealType,
	submittedAt: appeal.lpaQuestionnaire?.lpaQuestionnaireSubmittedDate || null, //new
	// @ts-ignore
	receivedAt: appeal.lpaQuestionnaire?.lpaqCreatedDate,
	procedureType: appeal.procedureType?.name,
	costsAppliedFor: appeal.lpaQuestionnaire?.lpaCostsAppliedFor, //new
	lpaStatement: appeal.lpaQuestionnaire?.lpaStatement, //new
	extraConditions: appeal.lpaQuestionnaire?.newConditionDetails, //check
	hasExtraConditions: appeal.lpaQuestionnaire?.newConditionDetails !== null,
	listedBuildingDetails: appeal.lpaQuestionnaire?.listedBuildingDetails
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
	documents: {
		// @ts-ignore
		whoNotified: {},
		// @ts-ignore
		conservationMap: {},
		// @ts-ignore
		lpaCaseCorrespondence: {},
		// @ts-ignore
		otherPartyRepresentations: {},
		// @ts-ignore
		planningOfficerReport: {}
	},

	localPlanningDepartment: appeal.lpa?.name,
	lpaNotificationMethods: appeal.lpaQuestionnaire?.lpaNotificationMethods?.map(
		({ lpaNotificationMethod: { name } }) => ({ name })
	),
	lpaQuestionnaireId: appeal.lpaQuestionnaire?.id || 1,
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
};
