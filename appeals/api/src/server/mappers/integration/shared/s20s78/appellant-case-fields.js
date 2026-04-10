/** @typedef {import('@planning-inspectorate/data-model').Schemas.LPAQuestionnaireCommand} LPAQuestionnaireCommand */
/** @typedef {import('@planning-inspectorate/data-model').Schemas.AppellantSubmissionCommand} AppellantSubmissionCommand */

const SIGNIFICANT_CHANGE_VALUE_MAP = {
	'Local plan': 'adopted-a-new-local-plan',
	'National policy': 'national-policy-change',
	'Court judgment': 'court-judgement',
	Other: 'other'
};

/**
 *
 * @param {{value: string, comment: string}[]|undefined} changes
 * @param {keyof SIGNIFICANT_CHANGE_VALUE_MAP} type
 * @returns {string|null}
 */
const extractSignificantChangeValue = (changes, type) => {
	const mappedValue = SIGNIFICANT_CHANGE_VALUE_MAP[type];
	const change = changes?.find((c) => c.value === mappedValue);
	return change?.comment ?? null;
};

/**
 * @param {Pick<AppellantSubmissionCommand, 'casedata'>} command
 */
export const createSharedS20S78Fields = (command) => {
	const significantChanges = /** @type {{value: string, comment: string}[] | undefined} */ (
		command.casedata.significantChangesAffectingApplicationAppellant
	);
	return {
		// @ts-ignore
		appellantProcedurePreference: command.casedata.appellantProcedurePreference,
		appellantProcedurePreferenceDetails: command.casedata.appellantProcedurePreferenceDetails,
		appellantProcedurePreferenceDuration: command.casedata.appellantProcedurePreferenceDuration,
		appellantProcedurePreferenceWitnessCount:
			command.casedata.appellantProcedurePreferenceWitnessCount,
		planningObligation: command.casedata.planningObligation,
		statusPlanningObligation: command.casedata.statusPlanningObligation,
		siteViewableFromRoad: command.casedata.siteViewableFromRoad,
		caseworkReason: command.casedata.caseworkReason,
		developmentType: command.casedata.developmentType,
		jurisdiction: command.casedata.jurisdiction,
		numberOfResidencesNetChange: command.casedata.numberOfResidencesNetChange,
		siteGridReferenceEasting: command.casedata.siteGridReferenceEasting,
		siteGridReferenceNorthing: command.casedata.siteGridReferenceNorthing,
		reasonForAppealAppellant: command.casedata.reasonForAppealAppellant,
		anySignificantChanges: (significantChanges?.length ?? 0) > 0 ? 'Yes' : 'No',
		anySignificantChanges_otherSignificantChanges: extractSignificantChangeValue(
			significantChanges,
			'Other'
		),
		anySignificantChanges_localPlanSignificantChanges: extractSignificantChangeValue(
			significantChanges,
			'Local plan'
		),
		anySignificantChanges_nationalPolicySignificantChanges: extractSignificantChangeValue(
			significantChanges,
			'National policy'
		),
		anySignificantChanges_courtJudgementSignificantChanges: extractSignificantChangeValue(
			significantChanges,
			'Court judgment'
		),
		screeningOpinionIndicatesEiaRequired: command.casedata.screeningOpinionIndicatesEiaRequired,
		ownershipCertificate: command.casedata.ownershipCertificate
	};
};
