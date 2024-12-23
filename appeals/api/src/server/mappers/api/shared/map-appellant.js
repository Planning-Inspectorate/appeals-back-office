/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Api.ServiceUser} Appellant */
/** @typedef {import('#mappers/mapper-factory.js').MappingRequest} MappingRequest */

/**
 *
 * @param {MappingRequest} data
 * @returns {Appellant|undefined}
 */
export const mapAppellant = (data) => {
	const { appeal } = data;

	if (appeal.appellant)
		return {
			serviceUserId: appeal.appellant.id,
			firstName: appeal.appellant.firstName || '',
			lastName: appeal.appellant.lastName || '',
			organisationName: appeal.appellant.organisationName || null,
			email: appeal.appellant?.email || '',
			phoneNumber: appeal.appellant.phoneNumber || null
		};
};
