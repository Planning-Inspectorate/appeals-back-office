import formatAddress from '#utils/format-address.js';

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Api.NeighbouringSite} NeighbouringSite */
/** @typedef {import('#mappers/mapper-factory.js').MappingRequest} MappingRequest */

/**
 *
 * @param {MappingRequest} data
 * @returns {NeighbouringSite[]}
 */
export const mapNeighbouringSites = (data) => {
	const { appeal } = data;

	return (
		appeal.neighbouringSites?.map((site) => {
			return {
				siteId: site.id,
				source: site.source,
				address: formatAddress(site.address)
			};
		}) || []
	);
};
