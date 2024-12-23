/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Api.LpaQuestionnaire} LpaQuestionnaire */
/** @typedef {import('#mappers/mapper-factory.js').MappingRequest} MappingRequest */
/**
 *
 * @param {MappingRequest} data
 * @returns {LpaQuestionnaire|undefined}
 */
export const mapLpaQuestionnaire = (data) => {
	const { appeal } = data;
	const { lpaQuestionnaire } = appeal;

	return {
		siteAccessRequired: {
			details: lpaQuestionnaire?.siteAccessDetails,
			isRequired: lpaQuestionnaire?.siteAccessDetails !== null
		},
		healthAndSafety: {
			details: lpaQuestionnaire?.siteSafetyDetails,
			hasIssues: lpaQuestionnaire?.siteSafetyDetails !== null
		},
		isGreenBelt: lpaQuestionnaire?.isGreenBelt,
		isAffectingNeighbouringSites: lpaQuestionnaire?.isAffectingNeighbouringSites
	};
};
