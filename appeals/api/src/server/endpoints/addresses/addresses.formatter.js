/** @typedef {import('@pins/appeals.api').Schema.Address} Address */
/** @typedef {import('@pins/appeals.api').Appeals.SingleAddressResponse} SingleAddressResponse */

/**
 * @param {Address} address
 * @returns {SingleAddressResponse}
 */
export const formatAddress = (address) => ({
	addressId: address.id,
	addressLine1: address.addressLine1,
	addressLine2: address.addressLine2,
	country: address.addressCountry,
	county: address.addressCounty,
	postcode: address.postcode,
	town: address.addressTown
});

/**
 * @param {SingleAddressResponse} address
 * @returns {Address}
 */
export const formatAddressForDb = (address) => ({
	id: address.addressId,
	addressLine1: address.addressLine1,
	addressLine2: address.addressLine2,
	addressTown: address.town,
	addressCounty: address.county,
	postcode: address.postcode,
	addressCountry: address.country
});

/**
 * @param {Address} address
 * @returns {string}
 */
export const formatAddressSingleLine = (address) => {
	const parts = [
		address.addressLine1,
		address.addressLine2,
		address.addressTown,
		address.addressCounty,
		address.postcode,
		address.addressCountry
	];

	return parts.filter((part) => part).join(', ');
};

/**
 * @param {Address} a
 * @returns {string}
 * */
export const formatAddressMultiline = (a) =>
	[a.addressLine1, a.addressLine2, a.addressTown, a.addressCounty, a.postcode]
		.filter(Boolean)
		.join('\n');
