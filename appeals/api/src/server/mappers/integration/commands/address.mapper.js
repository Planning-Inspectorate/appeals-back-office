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
