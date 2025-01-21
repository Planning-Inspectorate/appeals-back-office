/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Schema.NeighbouringSite} NeighbouringSite */
/** @typedef {import('#mappers/mapper-factory.js').MappingRequest} MappingRequest */

/**
 * @param {MappingRequest} data
 * @returns
 */
export const mapCaseAddresses = (data) => {
	const { appeal } = data;
	const neighbouringSiteAddresses = mapNeighbouringAddress(appeal.neighbouringSites ?? []);

	return {
		...mapAddress(appeal),
		...mapSiteSafetyDetails(appeal),
		...mapSiteAccessDetails(appeal),
		neighbouringSiteAddresses
	};
};

/**
 *
 * @param {Appeal} appeal
 * @returns
 */
export const mapAddress = (appeal) => {
	return {
		siteAddressLine1: appeal.address?.addressLine1,
		siteAddressLine2: appeal.address?.addressLine2 || '',
		siteAddressCounty: appeal.address?.addressCounty || '',
		siteAddressPostcode: appeal.address?.postcode,
		siteAddressTown: appeal.address?.addressTown || ''
	};
};

/**
 *
 * @param {Appeal | undefined} appeal
 * @returns
 */
export const mapEventAddressOut = (appeal) => {
	if (!appeal) {
		return null;
	}

	return {
		addressLine1: appeal.address?.addressLine1,
		addressLine2: appeal.address?.addressLine2 || '',
		addressCounty: appeal.address?.addressCounty || '',
		addressPostcode: appeal.address?.postcode,
		addressTown: appeal.address?.addressTown || ''
	};
};

/**
 *
 * @param {NeighbouringSite[]} sites
 * @returns
 */
export const mapNeighbouringAddress = (sites) => {
	if (!sites || sites.length === 0) {
		return null;
	}

	return sites.map((site) => {
		return {
			neighbouringSiteAddressLine1: site.address?.addressLine1,
			neighbouringSiteAddressLine2: site.address?.addressLine2 || '',
			neighbouringSiteAddressCounty: site.address?.addressCounty || '',
			neighbouringSiteAddressPostcode: site.address?.postcode,
			neighbouringSiteAddressTown: site.address?.addressTown || '',
			neighbouringSiteAccessDetails: null,
			neighbouringSiteSafetyDetails: null
		};
	});
};

/**
 *
 * @param {Appeal} appeal
 * @returns
 */
export const mapSiteAccessDetails = (appeal) => {
	return {
		siteAccessDetails: [
			appeal?.appellantCase?.siteAccessDetails || '',
			appeal?.lpaQuestionnaire?.siteAccessDetails || ''
		]
	};
};

/**
 *
 * @param {Appeal} appeal
 * @returns
 */
export const mapSiteSafetyDetails = (appeal) => {
	return {
		siteSafetyDetails: [
			appeal?.appellantCase?.siteSafetyDetails || '',
			appeal?.lpaQuestionnaire?.siteSafetyDetails || ''
		]
	};
};
