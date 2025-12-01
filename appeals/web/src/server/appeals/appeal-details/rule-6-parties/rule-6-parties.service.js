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
