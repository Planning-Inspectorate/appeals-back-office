/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Api.LpaQuestionnaire} LpaQuestionnaire */
/** @typedef {import('#mappers/mapper-factory.js').MappingRequest} MappingRequest */

/**
 *
 * @param {MappingRequest} data
 * @returns {LpaQuestionnaire|undefined}
 */
export const mapLdcLpaQuestionnaire = (data) => {
	const {
		appeal: { lpaQuestionnaire }
	} = data;

	if (lpaQuestionnaire) {
		return {
			hasInfrastructureLevy: lpaQuestionnaire.hasInfrastructureLevy,
			isInfrastructureLevyFormallyAdopted: lpaQuestionnaire.isInfrastructureLevyFormallyAdopted,
			infrastructureLevyAdoptedDate:
				lpaQuestionnaire.infrastructureLevyAdoptedDate &&
				lpaQuestionnaire.infrastructureLevyAdoptedDate.toISOString(),
			infrastructureLevyExpectedDate:
				lpaQuestionnaire.infrastructureLevyExpectedDate &&
				lpaQuestionnaire.infrastructureLevyExpectedDate.toISOString(),

			reasonForNeighbourVisits: lpaQuestionnaire.reasonForNeighbourVisits,

			lpaProcedurePreference: lpaQuestionnaire.lpaProcedurePreference,
			lpaProcedurePreferenceDetails: lpaQuestionnaire.lpaProcedurePreferenceDetails,
			lpaProcedurePreferenceDuration: lpaQuestionnaire.lpaProcedurePreferenceDuration
		};
	}
};
