/** @typedef {import('@pins/appeals.api').Schema.Address} Address */
/** @typedef {import('@pins/appeals.api').Appeals.SingleAddressResponse} SingleAddressResponse */

/**
 * @param {Address} address
 * @returns {SingleAddressResponse}
 */
const formatAddress = (address) => ({
	addressId: address.id,
	addressLine1: address.addressLine1,
	addressLine2: address.addressLine2,
	country: address.addressCountry,
	county: address.addressCounty,
	postcode: address.postcode,
	town: address.addressTown
});

/**
 * @param {Address} address
 * @returns {string}
 */
const formatAddressSingleLine = (address) => {
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

export { formatAddress, formatAddressSingleLine };
