/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {{preparationTime: number, sittingTime: number, reportingTime: number}} estimates
 * @returns {Promise<{hearingEstimateId: number}>}
 */
export const createHearingEstimates = async (request, estimates) => {
	const { appealId } = request.currentAppeal;
	const response = await request.apiClient
		.post(`appeals/${appealId}/hearing-estimates`, {
			json: estimates
		})
		.json();
	return response;
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {{preparationTime: number, sittingTime: number, reportingTime: number}} estimates
 * @returns {Promise<{hearingEstimateId: number}>}
 */
export const updateHearingEstimates = async (request, estimates) => {
	const { appealId } = request.currentAppeal;
	const response = await request.apiClient
		.patch(`appeals/${appealId}/hearing-estimates`, {
			json: estimates
		})
		.json();
	return response;
};
