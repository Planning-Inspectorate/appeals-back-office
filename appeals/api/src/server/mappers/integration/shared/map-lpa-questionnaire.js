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
	return {
		lpaStatement: casedata?.lpaStatement ?? null,
		isCorrectAppealType: casedata?.isCorrectAppealType ?? null,
		...(casedata && { isGreenBelt: casedata?.isGreenBelt ?? null }),
		inConservationArea: casedata?.inConservationArea ?? null,
		newConditionDetails: casedata?.newConditionDetails ?? null,
		// @ts-ignore
		notificationMethod: casedata?.lpaNotificationMethods
			? casedata?.lpaNotificationMethods.map((method) => method.lpaNotificationMethod.key)
			: null,
		lpaCostsAppliedFor: casedata?.lpaCostsAppliedFor ?? null,
		// @ts-ignore
		affectedListedBuildingNumbers:
			casedata?.listedBuildingDetails
				?.filter((lp) => lp.affectsListedBuilding)
				.map((lb) => lb.listEntry) || null,
		reasonForNeighbourVisits: casedata?.reasonForNeighbourVisits
	};
};
