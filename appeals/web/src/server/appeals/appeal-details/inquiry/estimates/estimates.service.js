/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {{preparationTime: number, sittingTime: number, reportingTime: number}} estimates
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

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {{preparationTime: number, sittingTime: number, reportingTime: number}} estimates
 * @returns {Promise<{inquiryEstimateId: number}>}
 */
export const updateInquiryEstimates = async (request, estimates) => {
	const { appealId } = request.currentAppeal;
	const response = await request.apiClient
		.patch(`appeals/${appealId}/inquiry-estimates`, {
			json: estimates
		})
		.json();
	return response;
};
