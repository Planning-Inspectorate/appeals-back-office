/** @typedef {import('#db-client/models.ts').AddressModel} AddressModel */

/**
 * @param {{
 * 		addressLine1: AddressModel['addressLine1'],
 * 		addressLine2?: AddressModel['addressLine2'],
 * 		addressTown?: AddressModel['addressTown'],
 * 		addressCounty?: AddressModel['addressCounty'],
 * 		postcode?: AddressModel['postcode']
 * 	} | null} [address]
 * @returns {{
 *   addressLine1: string,
 *   addressLine2?: string,
 *   town?: string,
 *   county?: string,
 *   postCode: string
 * }}
 */
const formatAddress = (address) => ({
	addressLine1: address?.addressLine1 || '',
	...(address?.addressLine2 && { addressLine2: address.addressLine2 }),
	...(address?.addressTown && { town: address.addressTown }),
	...(address?.addressCounty && { county: address.addressCounty }),
	postCode: address?.postcode || ''
});

export default formatAddress;
