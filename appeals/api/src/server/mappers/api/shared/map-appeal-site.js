import formatAddress from '#utils/format-address.js';

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Api.Address} Address */
/** @typedef {import('#mappers/mapper-factory.js').MappingRequest} MappingRequest */

/**
 *
 * @param {MappingRequest} data
 * @returns {Address}
 */
export const mapAppealSite = (data) => {
	const { appeal } = data;

	return {
		addressId: appeal.address?.id,
		...formatAddress(appeal.address)
	};
};
