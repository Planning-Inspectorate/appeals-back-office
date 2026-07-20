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
	const significantChanges =
		/** @type {import('@planning-inspectorate/data-model').Schemas.AppealS78Case['significantChangesAffectingApplicationLpa']} */ (
			casedata?.anySignificantChangesLpa === 'Yes'
				? [
						{
							value: 'adopted-a-new-local-plan',
							comment: casedata?.anySignificantChangesLpa_localPlanSignificantChanges ?? null
						},
						{
							value: 'national-policy-change',
							comment: casedata?.anySignificantChangesLpa_nationalPolicySignificantChanges ?? null
						},
						{
							value: 'court-judgement',
							comment: casedata?.anySignificantChangesLpa_courtJudgementSignificantChanges ?? null
						},
						{
							value: 'other',
							comment: casedata?.anySignificantChangesLpa_otherSignificantChanges ?? null
						}
					].filter((c) => c.comment !== null)
				: []
		);
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
			casedata?.didAppellantSubmitCompletePhotosAndPlans ?? null,
		listOfDocumentsBeforeDecision: casedata?.listOfDocumentsBeforeDecision ?? null,
		anySignificantChangesAffectingApplicationLpa: significantChanges
	};
};
