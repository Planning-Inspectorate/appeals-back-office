/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('pins-data-model').Schemas.AppealS78Case} AppealS78Case */
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
		designAccessStatementProvided: null
	};
};
