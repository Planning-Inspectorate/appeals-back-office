/** @typedef {import('#appeals/appeal-details/appeal-details.types.js').AppealRule6Party} AppealRule6Party */

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {Record<string, string>} serviceUserDetails
 * @returns {Promise<AppealRule6Party>}
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
 * @returns {Promise<AppealRule6Party>}
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

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {string} rule6PartyId
 * @returns {Promise<{ appealId: number, rule6PartyId: number }>}
 */
export const deleteRule6Party = async (request, rule6PartyId) => {
	const { appealId } = request.currentAppeal;

	const response = await request.apiClient
		.delete(`appeals/${appealId}/rule-6-parties/${rule6PartyId}`)
		.json();

	return response;
};
