/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('pins-data-model').Schemas.AppealHASCase} AppealHASCase */
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
		applicationDecision: casedata?.applicationDecision,
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
		typeOfPlanningApplication: casedata?.typeOfPlanningApplication ?? null
	};
};
