import { assertValidNumericIds } from '#lib/validators/api-parameters.validator.js';
/**
 *
 * @param {import('got').Got} apiClient
 * @param {*} appealId
 * @param {string} source
 * @param {import('@pins/appeals.api').Appeals.AppealSite} neighbouringSite
 * @returns {Promise<{}>}
 */
export function addNeighbouringSite(apiClient, appealId, source, neighbouringSite) {
	const formattedNeighbouringSite = {
		source: source,
		addressLine1: neighbouringSite.addressLine1,
		...(neighbouringSite.addressLine2 && { addressLine2: neighbouringSite.addressLine2 }),
		...(neighbouringSite.county && { county: neighbouringSite.county }),
		postcode: neighbouringSite.postCode,
		town: neighbouringSite.town
	};
	const ids = assertValidNumericIds({ appealId });
	return apiClient.post(`appeals/${ids.appealId}/neighbouring-sites`, {
		json: {
			...formattedNeighbouringSite
		}
	});
}

/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {import('@pins/appeals.api').Appeals.AppealSite} neighbouringSite
 * @param {string} siteId
 * @returns {Promise<{}>}
 */
export function changeNeighbouringSite(apiClient, appealId, neighbouringSite, siteId) {
	const formattedNeighbouringSite = {
		siteId: siteId,
		address: {
			addressLine1: neighbouringSite.addressLine1,
			addressLine2: neighbouringSite.addressLine2 ?? '',
			county: neighbouringSite.county ?? '',
			postcode: neighbouringSite.postCode,
			town: neighbouringSite.town
		}
	};

	const ids = assertValidNumericIds({ appealId });
	return apiClient.patch(`appeals/${ids.appealId}/neighbouring-sites`, {
		json: {
			...formattedNeighbouringSite
		}
	});
}

/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} siteId
 * @returns {Promise<{}>}
 */
export function removeNeighbouringSite(apiClient, appealId, siteId) {
	const formattedSiteId = {
		siteId: siteId
	};

	const ids = assertValidNumericIds({ appealId });
	return apiClient.delete(`appeals/${ids.appealId}/neighbouring-sites`, {
		json: {
			...formattedSiteId
		}
	});
}
