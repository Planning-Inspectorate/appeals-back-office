/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Api.LpaQuestionnaire} LpaQuestionnaire */
/** @typedef {import('#mappers/mapper-factory.js').MappingRequest} MappingRequest */
/**
 *
 * @param {MappingRequest} data
 * @returns {LpaQuestionnaire|undefined}
 */
export const mapS78LpaQuestionnaire = (data) => {
	const {
		appeal: { lpaQuestionnaire }
	} = data;

	if (lpaQuestionnaire) {
		return {
			lpaProcedurePreference: lpaQuestionnaire.lpaProcedurePreference,
			designatedSiteNames: [
				...(lpaQuestionnaire.designatedSiteNames ?? []).map((item) => ({
					id: item.designatedSite.id,
					key: item.designatedSite.key,
					name: item.designatedSite.name
				})),
				...(lpaQuestionnaire.designatedSiteNameCustom
					? [
							{
								id: 0,
								key: 'custom',
								name: lpaQuestionnaire.designatedSiteNameCustom
							}
					  ]
					: [])
			],
			lpaStatement: lpaQuestionnaire.lpaStatement,
			extraConditions: lpaQuestionnaire.newConditionDetails,
			hasExtraConditions: lpaQuestionnaire.newConditionDetails !== null,
			affectsScheduledMonument: lpaQuestionnaire.affectsScheduledMonument,
			eiaColumnTwoThreshold: lpaQuestionnaire.eiaColumnTwoThreshold,
			eiaRequiresEnvironmentalStatement: lpaQuestionnaire.eiaRequiresEnvironmentalStatement,
			eiaEnvironmentalImpactSchedule: lpaQuestionnaire.eiaEnvironmentalImpactSchedule,
			eiaDevelopmentDescription: lpaQuestionnaire.eiaDevelopmentDescription,
			hasProtectedSpecies: lpaQuestionnaire.hasProtectedSpecies,
			isAonbNationalLandscape: lpaQuestionnaire.isAonbNationalLandscape,
			isGypsyOrTravellerSite: lpaQuestionnaire.isGypsyOrTravellerSite,
			hasInfrastructureLevy: lpaQuestionnaire.hasInfrastructureLevy,
			isInfrastructureLevyFormallyAdopted: lpaQuestionnaire.isInfrastructureLevyFormallyAdopted,
			infrastructureLevyAdoptedDate:
				lpaQuestionnaire.infrastructureLevyAdoptedDate &&
				lpaQuestionnaire.infrastructureLevyAdoptedDate.toISOString(),
			infrastructureLevyExpectedDate:
				lpaQuestionnaire.infrastructureLevyExpectedDate &&
				lpaQuestionnaire.infrastructureLevyExpectedDate.toISOString(),
			lpaProcedurePreferenceDetails: lpaQuestionnaire.lpaProcedurePreferenceDetails,
			lpaProcedurePreferenceDuration: lpaQuestionnaire.lpaProcedurePreferenceDuration,
			eiaSensitiveAreaDetails: lpaQuestionnaire.eiaSensitiveAreaDetails,
			consultedBodiesDetails: lpaQuestionnaire.consultedBodiesDetails,
			reasonForNeighbourVisits: lpaQuestionnaire.reasonForNeighbourVisits
		};
	}
};
