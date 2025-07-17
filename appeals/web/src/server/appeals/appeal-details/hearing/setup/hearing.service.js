/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {{hearingStartTime: string, address?: {addressLine1: string, addressLine2?: string, town: string, county?: string, postcode: string}}} hearingDetails
 * @returns {Promise<{hearingEstimateId: number}>}
 */
export const createHearing = async (request, hearingDetails) => {
	const { appealId } = request.currentAppeal;

	const response = await request.apiClient
		.post(`appeals/${appealId}/hearing`, {
			json: hearingDetails
		})
		.json();

	return response;
};
/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {string} hearingId
 * @param {{hearingStartTime?: string, address?: {addressLine1: string, addressLine2?: string, town: string, county?: string, postcode: string} | null, addressId?: string}} hearingDetails
 * @returns {Promise<{hearingEstimateId: number}>}
 */
export const updateHearing = async (request, hearingId, hearingDetails) => {
	const { appealId } = request.currentAppeal;

	const response = await request.apiClient
		.patch(`appeals/${appealId}/hearing/${hearingId}`, {
			json: hearingDetails
		})
		.json();

	return response;
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {string} hearingId
 * @returns {Promise<{hearingEstimateId: number}>}
 */
export const cancelHearing = async (request, hearingId) => {
	const { appealId } = request.currentAppeal;

	const response = await request.apiClient
		.delete(`appeals/${appealId}/hearing/${hearingId}`)
		.json();

	return response;
};
