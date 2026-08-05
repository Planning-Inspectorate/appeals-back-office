/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@planning-inspectorate/data-model').Schemas.AppealS78Case} AppealS78Case */
/** @typedef {import('#mappers/mapper-factory.js').MappingRequest} MappingRequest */
/**
 *
 * @param {MappingRequest} data
 */
export const mapAppellantCaseSharedFields = (data) => {
	const { appeal } = data;

	const casedata = appeal.appellantCase;

	return {
		// @ts-ignore
		appellantProcedurePreference: casedata?.appellantProcedurePreference,
		appellantProcedurePreferenceDetails: casedata?.appellantProcedurePreferenceDetails ?? null,
		appellantProcedurePreferenceDuration: casedata?.appellantProcedurePreferenceDuration ?? null,
		appellantProcedurePreferenceWitnessCount:
			casedata?.appellantProcedurePreferenceWitnessCount ?? null,
		caseworkReason: casedata?.caseworkReason ?? null,
		// @ts-ignore
		developmentType: casedata?.developmentType ?? null,
		jurisdiction: casedata?.jurisdiction ?? null,
		numberOfResidencesNetChange: casedata?.numberOfResidencesNetChange ?? null,
		siteGridReferenceEasting: casedata?.siteGridReferenceEasting ?? null,
		siteGridReferenceNorthing: casedata?.siteGridReferenceNorthing ?? null,
		siteViewableFromRoad: casedata?.siteViewableFromRoad ?? null,
		planningObligation: casedata?.planningObligation ?? null,
		statusPlanningObligation: casedata?.statusPlanningObligation ?? null,
		// @ts-ignore
		typeOfPlanningApplication: casedata?.typeOfPlanningApplication,
		//TODO:
		designAccessStatementProvided: null,
		reasonForAppealAppellant: casedata?.reasonForAppealAppellant ?? null,
		/** @type {any[]} */
		significantChangesAffectingApplicationAppellant:
			casedata?.anySignificantChanges === 'Yes'
				? [
						{
							value: 'adopted-a-new-local-plan',
							comment: casedata?.anySignificantChanges_localPlanSignificantChanges ?? null
						},
						{
							value: 'national-policy-change',
							comment: casedata?.anySignificantChanges_nationalPolicySignificantChanges ?? null
						},
						{
							value: 'court-judgement',
							comment: casedata?.anySignificantChanges_courtJudgementSignificantChanges ?? null
						},
						{
							value: 'other',
							comment: casedata?.anySignificantChanges_otherSignificantChanges ?? null
						}
					].filter((c) => c.comment !== null)
				: []
	};
};
