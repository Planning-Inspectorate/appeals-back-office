/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {{inquiryStartTime: string, address?: {addressLine1: string, addressLine2?: string, town: string, county?: string, postcode: string}}} inquiryDetails
 * @returns {Promise<{inquiryId: number}>}
 */
export const createInquiry = async (request, inquiryDetails) => {
	const { appealId } = request.currentAppeal;

	return await request.apiClient
		.post(`appeals/${appealId}/inquiry`, {
			json: inquiryDetails
		})
		.json();
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {{estimatedTime: number }} estimates
 * @returns {Promise<{inquiryEstimateId: number}>}
 */
export const createInquiryEstimates = async (request, estimates) => {
	const { appealId } = request.currentAppeal;
	const response = await request.apiClient
		.post(`appeals/${appealId}/inquiry-estimates`, {
			json: estimates
		})
		.json();
	return response;
};
