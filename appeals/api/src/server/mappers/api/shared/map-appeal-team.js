/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Api.Team} Team */
/** @typedef {import('#mappers/mapper-factory.js').MappingRequest} MappingRequest */

/**
 *
 * @param {MappingRequest} data
 * @returns {Team}
 */
export const mapAppealTeam = (data) => {
	const { appeal } = data;

	return {
		caseOfficer: appeal.caseOfficer?.azureAdUserId,
		inspector: appeal.inspector?.azureAdUserId,
		padsInspector: appeal.padsInspectorUserId || null
	};
};
