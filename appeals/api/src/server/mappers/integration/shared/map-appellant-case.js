/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@planning-inspectorate/data-model').Schemas.AppealHASCase} AppealHASCase */
/** @typedef {import('#mappers/mapper-factory.js').MappingRequest} MappingRequest */
/**
 *
 * @param {MappingRequest} data
 * @returns {AppealHASCase}
 */
export const mapAppellantCase = (data) => {
	const { appeal } = data;

	const casedata = appeal.appellantCase;

	return {
		// @ts-ignore
		applicationDecision: casedata?.applicationDecision ?? null,
		siteAreaSquareMetres: casedata?.siteAreaSquareMetres
			? Number(casedata.siteAreaSquareMetres)
			: null,
		floorSpaceSquareMetres: casedata?.floorSpaceSquareMetres
			? Number(casedata.floorSpaceSquareMetres)
			: null,
		ownsAllLand: casedata?.ownsAllLand ?? null,
		ownsSomeLand: casedata?.ownsSomeLand ?? null,
		advertisedAppeal: casedata?.hasAdvertisedAppeal ?? null,
		appellantCostsAppliedFor: casedata?.appellantCostsAppliedFor ?? null,
		originalDevelopmentDescription: casedata?.originalDevelopmentDescription ?? null,
		changedDevelopmentDescription: casedata?.changedDevelopmentDescription ?? null,
		// @ts-ignore
		knowsAllOwners: casedata?.knowsAllOwners?.name ?? null,
		// @ts-ignore
		knowsOtherOwners: casedata?.knowsOtherOwners?.name ?? null,
		ownersInformed: casedata?.ownersInformed ?? null,
		enforcementNotice: casedata?.enforcementNotice ?? null,
		isGreenBelt: casedata?.isGreenBelt ?? null,
		// @ts-ignore
		typeOfPlanningApplication: casedata?.typeOfPlanningApplication ?? null,
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
