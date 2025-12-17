/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('#mappers/mapper-factory.js').MappingRequest} MappingRequest */

/**
 * @param {MappingRequest} data
 * @returns {{ caseOfficerId: string|null, inspectorId: string|null, padsSapId: string|null }}
 */
export const mapCaseTeam = (data) => {
	const { appeal } = data;

	return {
		caseOfficerId: appeal.caseOfficer?.azureAdUserId || null,
		inspectorId: appeal.inspector?.azureAdUserId || null,
		padsSapId: appeal.padsInspectorUserId || null
	};
};
