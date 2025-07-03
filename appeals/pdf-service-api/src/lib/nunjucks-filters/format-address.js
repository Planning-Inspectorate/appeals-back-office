export function formatAddress(address) {
	const { addressLine1, addressLine2, town, county, postCode } = address || {};
	return [addressLine1, addressLine2, town, county, postCode]
		.filter((item) => item?.trim())
		.join(', ');
}
