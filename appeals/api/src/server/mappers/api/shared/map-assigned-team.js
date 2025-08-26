/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Api.Team} Team */
/** @typedef {import('@pins/appeals.api').Api.AssignedTeam} AssignedTeam */
/** @typedef {import('#mappers/mapper-factory.js').MappingRequest} MappingRequest */

/**
 *
 * @param {MappingRequest} data
 * @returns
 */
export const mapAssignedTeam = (data) => {
	const { appeal } = data;

	return {
		name: appeal.assignedTeam?.name || null,
		email: appeal.assignedTeam?.email || null
	};
};
