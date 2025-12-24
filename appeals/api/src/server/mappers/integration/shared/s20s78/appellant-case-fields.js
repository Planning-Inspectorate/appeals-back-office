/** @typedef {import('@planning-inspectorate/data-model').Schemas.LPAQuestionnaireCommand} LPAQuestionnaireCommand */

/**
 *
 * @param {Pick<LPAQuestionnaireCommand, 'casedata'>} command
 * @returns {Omit<import('#db-client/models.ts').LPAQuestionnaireCreateInput, 'appeal'>}
 */

export const createSharedS20S78Fields = (command) => ({
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
	siteGridReferenceNorthing: command.casedata.siteGridReferenceNorthing
});
