/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Api.ServiceUser} Agent */
/** @typedef {import('#mappers/mapper-factory.js').MappingRequest} MappingRequest */

/**
 *
 * @param {MappingRequest} data
 * @returns {Agent|undefined}
 */
export const mapAgent = (data) => {
	const { appeal } = data;
	if (appeal.agent)
		return {
			serviceUserId: appeal.agent.id,
			firstName: appeal.agent.firstName || '',
			lastName: appeal.agent.lastName || '',
			organisationName: appeal.agent.organisationName,
			email: appeal.agent.email || '',
			phoneNumber: appeal.agent.phoneNumber
		};
};
