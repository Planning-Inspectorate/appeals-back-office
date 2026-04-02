/** @typedef {import('@planning-inspectorate/data-model').Schemas.LPAQuestionnaireCommand} LPAQuestionnaireCommand */
/** @typedef {import('@planning-inspectorate/data-model').Schemas.AppellantSubmissionCommand} AppellantSubmissionCommand */

/**
 *
 * @param {string[]|undefined} changes
 * @param {string} type
 * @returns {string|null}
 */
const extractSignificantChangeValue = (changes, type) => {
	const change = changes?.find((s) => s.startsWith(`${type}:`));
	if (change) {
		return change.replace(`${type}:`, '').trim();
	}
	return null;
};

/**
 * @param {Pick<AppellantSubmissionCommand, 'casedata'>} command
 */
export const createSharedS20S78Fields = (command) => {
	const significantChanges = /** @type {string[] | undefined} */ (
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
