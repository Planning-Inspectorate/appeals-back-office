/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@planning-inspectorate/data-model').Schemas.AppealHASCase} AppealHASCase */
/** @typedef {import('#mappers/mapper-factory.js').MappingRequest} MappingRequest */

/**
 *
 * @param {MappingRequest} data
 * @returns {AppealHASCase}
 */
export const mapLpaQuestionnaire = (data) => {
	const { appeal } = data;

	const casedata = appeal.lpaQuestionnaire;

	const designatedSitesNames = [
		...(casedata?.designatedSiteNames ?? []).map((item) => item.designatedSite.key),
		...(casedata?.designatedSiteNameCustom ? [casedata?.designatedSiteNameCustom] : [])
	];

	return {
		affectsScheduledMonument: casedata?.affectsScheduledMonument ?? null,
		hasProtectedSpecies: casedata?.hasProtectedSpecies ?? null,
		isAonbNationalLandscape: casedata?.isAonbNationalLandscape ?? null,
		hasStatutoryConsultees: casedata?.hasStatutoryConsultees ?? null,
		consultedBodiesDetails: casedata?.consultedBodiesDetails ?? null,
		hasEmergingPlan: casedata?.hasEmergingPlan ?? null,
		// @ts-ignore
		lpaProcedurePreference: casedata?.lpaProcedurePreference ?? null,
		lpaProcedurePreferenceDetails: casedata?.lpaProcedurePreferenceDetails ?? null,
		lpaProcedurePreferenceDuration: casedata?.lpaProcedurePreferenceDuration ?? null,
		designatedSitesNames,
		siteWithinSSSI: casedata?.siteWithinSSSI ?? null,
		isSiteInAreaOfSpecialControlAdverts: casedata?.isSiteInAreaOfSpecialControlAdverts ?? null,
		wasApplicationRefusedDueToHighwayOrTraffic:
			casedata?.wasApplicationRefusedDueToHighwayOrTraffic ?? null,
		didAppellantSubmitCompletePhotosAndPlans:
			casedata?.didAppellantSubmitCompletePhotosAndPlans ?? null
	};
};
