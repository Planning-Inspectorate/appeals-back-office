/**
 * Takes an address object and returns string in web UI format (e.g.  Line1\nLine2)
 * @param {*} address object containg address fields
 */
export function formatAddress(address) {
	const formattedAddress = Object.keys(address)
		.map((key) => address[key])
		.join('\n');

	return formattedAddress;
}
