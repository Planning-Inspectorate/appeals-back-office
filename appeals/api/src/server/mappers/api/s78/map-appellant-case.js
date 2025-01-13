/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Api.AppellantCase} AppellantCase */
/** @typedef {import('#mappers/mapper-factory.js').MappingRequest} MappingRequest */
/**
 *
 * @param {MappingRequest} data
 * @returns {AppellantCase|undefined}
 */
export const mapAppellantCase = (data) => {
	const {
		appeal: { appellantCase }
	} = data;

	return {
		appellantProcedurePreference: appellantCase?.appellantProcedurePreference,
		appellantProcedurePreferenceDetails: appellantCase?.appellantProcedurePreferenceDetails,
		appellantProcedurePreferenceDuration: appellantCase?.appellantProcedurePreferenceDuration,
		appellantProcedurePreferenceWitnessCount:
			appellantCase?.appellantProcedurePreferenceWitnessCount,
		developmentDescription: {
			details: appellantCase?.originalDevelopmentDescription || null,
			isChanged: appellantCase?.changedDevelopmentDescription === true
		},
		planningObligation: {
			hasObligation: appellantCase?.planningObligation,
			status: appellantCase?.statusPlanningObligation
		},
		agriculturalHolding: {
			isPartOfAgriculturalHolding: appellantCase?.agriculturalHolding,
			isTenant: appellantCase?.tenantAgriculturalHolding,
			hasOtherTenants: appellantCase?.otherTenantsAgriculturalHolding
		}
	};
};
