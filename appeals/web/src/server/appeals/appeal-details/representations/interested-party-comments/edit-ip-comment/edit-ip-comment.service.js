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

/**
 * @param {import('got').Got} apiClient
 * @param {number} appealId
 * @param {number} commentId
 * */
export const unsetSiteVisitRequested = (apiClient, appealId, commentId) =>
	apiClient
		.patch(`appeals/${appealId}/reps/${commentId}`, {
			json: { siteVisitRequested: false }
		})
		.json();

/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} commentId
 * */
export const patchInterestedPartyComment = (apiClient, appealId, commentId) =>
	apiClient.patch(`appeals/${appealId}/reps/${commentId}`, {}).json();
