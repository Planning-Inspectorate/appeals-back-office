/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Schema.NeighbouringSite} NeighbouringSite */

/**
 *
 * @param {*} casedata
 * @returns
 */
export const mapAddressIn = (casedata) => {
	return {
		addressLine1: casedata.siteAddressLine1,
		addressLine2: casedata.siteAddressLine2,
		addressCounty: casedata.siteAddressCounty,
		postcode: casedata.siteAddressPostcode,
		addressTown: casedata.siteAddressTown
	};
};

/**
 *
 * @param {*} casedata
 * @returns
 */
export const mapNeighbouringAddressIn = (casedata) => {
	return {
		addressLine1: casedata.neighbouringSiteAddressLine1,
		addressLine2: casedata.neighbouringSiteAddressLine2,
		addressCounty: casedata.neighbouringSiteAddressCounty,
		postcode: casedata.neighbouringSiteAddressPostcode,
		addressTown: casedata.neighbouringSiteAddressTown
	};
};

/**
 *
 * @param {Appeal} appeal
 * @returns
 */
export const mapAddressOut = (appeal) => {
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
export const mapNeighbouringAddressOut = (sites) => {
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
export const mapSiteAccessDetailsOut = (appeal) => {
	return {
		siteAccessDetails: [
			appeal?.appellantCase?.siteAccessDetails,
			appeal?.lpaQuestionnaire?.siteAccessDetails
		].filter((item) => item && item !== null)
	};
};

/**
 *
 * @param {Appeal} appeal
 * @returns
 */
export const mapSiteSafetyDetailsOut = (appeal) => {
	return {
		siteSafetyDetails: [
			appeal?.appellantCase?.siteSafetyDetails,
			appeal?.lpaQuestionnaire?.siteSafetyDetails
		].filter((item) => item && item !== null)
	};
};
