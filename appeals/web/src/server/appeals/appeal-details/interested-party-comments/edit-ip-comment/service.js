/** @typedef {{ addressLine1: string, addressLine2?: string, town: string, county?: string, postCode: string }} AddressInput */

/**
 * @param {import('got').Got} apiClient
 * @param {number} appealId
 * @param {number} representedId
 * @param {AddressInput} address
 * @returns {Promise<import('@pins/appeals.api').Appeals.ServiceUserResponse>}
 * */
export const updateAddress = (apiClient, appealId, representedId, address) =>
	apiClient
		.patch(`appeals/${appealId}/service-user/${representedId}/address`, {
			json: {
				addressLine1: address.addressLine1,
				addressLine2: address.addressLine2,
				town: address.town,
				county: address.county,
				postcode: address.postCode
			}
		})
		.json();
