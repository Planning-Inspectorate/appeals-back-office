/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Api.LpaQuestionnaire} LpaQuestionnaire */
/** @typedef {import('#mappers/mapper-factory.js').MappingRequest} MappingRequest */
/**
 *
 * @param {MappingRequest} data
 * @returns {LpaQuestionnaire|undefined}
 */
export const mapCasAdvertLpaQuestionnaire = (data) => {
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
			extraConditions: lpaQuestionnaire.newConditionDetails,
			hasExtraConditions: lpaQuestionnaire.newConditionDetails !== null,
			affectsScheduledMonument: lpaQuestionnaire.affectsScheduledMonument,
			hasProtectedSpecies: lpaQuestionnaire.hasProtectedSpecies,
			isAonbNationalLandscape: lpaQuestionnaire.isAonbNationalLandscape,
			lpaProcedurePreferenceDetails: lpaQuestionnaire.lpaProcedurePreferenceDetails,
			lpaProcedurePreferenceDuration: lpaQuestionnaire.lpaProcedurePreferenceDuration,
			consultedBodiesDetails: lpaQuestionnaire.consultedBodiesDetails,
			reasonForNeighbourVisits: lpaQuestionnaire.reasonForNeighbourVisits,
			isSiteInAreaOfSpecialControlAdverts: lpaQuestionnaire.isSiteInAreaOfSpecialControlAdverts,
			wasApplicationRefusedDueToHighwayOrTraffic:
				lpaQuestionnaire.wasApplicationRefusedDueToHighwayOrTraffic,
			didAppellantSubmitCompletePhotosAndPlans:
				lpaQuestionnaire.didAppellantSubmitCompletePhotosAndPlans
		};
	}
};
