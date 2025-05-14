/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {{hearingStartTime: string, address?: {addressLine1: string, addressLine2?: string, town: string, county?: string, postcode: string}}} hearing
 * @returns {Promise<{hearingEstimateId: number}>}
 */
export const createHearing = async (request, hearing) => {
	const { appealId } = request.currentAppeal;
	const response = await request.apiClient
		.post(`appeals/${appealId}/hearing`, {
			json: hearing
		})
		.json();
	return response;
};
