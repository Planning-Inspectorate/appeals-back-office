/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Schema.NeighbouringSite} NeighbouringSite */

/**
 *
 * @param {*} casedata
 * @returns
 */
export const mapAddressIn = (casedata) => {
	return {
		addressLine1: casedata.siteAddressLine1 || casedata.addressLine1,
		addressLine2: casedata.siteAddressLine2 || casedata.addressLine2,
		addressCounty: casedata.siteAddressCounty || casedata.addressCounty,
		postcode: casedata.siteAddressPostcode || casedata.addressPostcode,
		addressTown: casedata.siteAddressTown || casedata.addressTown
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
 * @param {*} casedata
 * @returns
 */
export const mapContactAddressIn = (casedata) => {
	return {
		addressLine1: casedata.contactAddressLine1,
		addressLine2: casedata.contactAddressLine2,
		addressCounty: casedata.contactAddressCounty,
		postcode: casedata.contactAddressPostcode,
		addressTown: casedata.contactAddressTown
	};
};
