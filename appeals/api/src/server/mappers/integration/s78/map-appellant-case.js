/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('pins-data-model').Schemas.AppealS78Case} AppealS78Case */
/** @typedef {import('#mappers/mapper-factory.js').MappingRequest} MappingRequest */
/**
 *
 * @param {MappingRequest} data
 * @returns {AppealS78Case}
 */
export const mapAppellantCase = (data) => {
	const { appeal } = data;

	const casedata = appeal.appellantCase;

	return {
		// @ts-ignore
		appellantProcedurePreference: casedata?.appellantProcedurePreference,
		appellantProcedurePreferenceDetails: casedata?.appellantProcedurePreferenceDetails ?? null,
		appellantProcedurePreferenceDuration: casedata?.appellantProcedurePreferenceDuration ?? null,
		appellantProcedurePreferenceWitnessCount:
			casedata?.appellantProcedurePreferenceWitnessCount ?? null,
		informedTenantsAgriculturalHolding: casedata?.informedTenantsAgriculturalHolding ?? null,
		agriculturalHolding: casedata?.agriculturalHolding ?? null,
		tenantAgriculturalHolding: casedata?.tenantAgriculturalHolding ?? null,
		otherTenantsAgriculturalHolding: casedata?.otherTenantsAgriculturalHolding ?? null,
		caseworkReason: casedata?.caseworkReason ?? null,
		developmentType: casedata?.developmentType ?? null,
		jurisdiction: casedata?.jurisdiction ?? null,
		numberOfResidencesNetChange: casedata?.numberOfResidencesNetChange ?? null,
		siteGridReferenceEasting: casedata?.siteGridReferenceEasting ?? null,
		siteGridReferenceNorthing: casedata?.siteGridReferenceNorthing ?? null,
		siteViewableFromRoad: casedata?.siteViewableFromRoad ?? null,
		planningObligation: casedata?.planningObligation ?? null,
		statusPlanningObligation: casedata?.statusPlanningObligation ?? null,

		//TODO:

		designAccessStatementProvided: null,
		inquiryHowManyWitnesses: null
	};
};
