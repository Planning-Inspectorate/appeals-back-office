import { assertValidNumericIds } from '#lib/validators/api-parameters.validator.js';
/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {import('@pins/appeals.api').Appeals.AppealSite} siteAddress
 * @param {string} addressId
 * @returns {Promise<{}>}
 */
export function changeSiteAddress(apiClient, appealId, siteAddress, addressId) {
	const formattedSiteAddress = {
		addressLine1: siteAddress.addressLine1,
		addressLine2: siteAddress.addressLine2,
		county: siteAddress.county,
		postcode: siteAddress.postCode,
		town: siteAddress.town
	};

	const ids = assertValidNumericIds({ appealId, addressId });
	return apiClient.patch(`appeals/${ids.appealId}/addresses/${ids.addressId}`, {
		json: {
			...formattedSiteAddress
		}
	});
}
