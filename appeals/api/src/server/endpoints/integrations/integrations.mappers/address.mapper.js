// @ts-nocheck
// TODO: schemas (PINS data model)

export const mapAddressIn = (casedata) => {
	return {
		addressLine1: casedata.siteAddressLine1,
		addressLine2: casedata.siteAddressLine2,
		addressCounty: casedata.siteAddressCounty,
		postcode: casedata.siteAddressPostcode,
		addressTown: casedata.siteAddressTown
	};
};

export const mapNeighbouringAddressIn = (casedata) => {
	return {
		addressLine1: casedata.neighbouringSiteAddressLine1,
		addressLine2: casedata.neighbouringSiteAddressLine2,
		addressCounty: casedata.neighbouringSiteAddressCounty,
		postcode: casedata.neighbouringSiteAddressPostcode,
		addressTown: casedata.neighbouringSiteAddressTown
	};
};

export const mapAddressOut = (appeal) => {
	return {
		siteAddressLine1: appeal.address.addressLine1,
		siteAddressLine2: appeal.address.addressLine2 || '',
		siteAddressCounty: appeal.address.addressCounty || '',
		siteAddressPostcode: appeal.address.postcode,
		siteAddressTown: appeal.address.addressTown || ''
	};
};
