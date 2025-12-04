/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {Record<string, string>} serviceUserDetails
 * @returns {Promise<{hearingEstimateId: number}>}
 */
export const addRule6Party = async (request, serviceUserDetails) => {
	const { appealId } = request.currentAppeal;

	const response = await request.apiClient
		.post(`appeals/${appealId}/rule-6-parties`, {
			json: { serviceUser: serviceUserDetails }
		})
		.json();

	return response;
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {string} rule6PartyId
 * @param {Record<string, string>} serviceUserDetails
 * @returns {Promise<{hearingEstimateId: number}>}
 */
export const updateRule6Party = async (request, rule6PartyId, serviceUserDetails) => {
	const { appealId } = request.currentAppeal;

	const response = await request.apiClient
		.patch(`appeals/${appealId}/rule-6-parties/${rule6PartyId}`, {
			json: { serviceUser: serviceUserDetails }
		})
		.json();

	return response;
};
