/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {string} hearingId
 * @returns {Promise<{hearingEstimateId: number}>}
 */
export const cancelInquiry = async (request, hearingId) => {
	const { appealId } = request.currentAppeal;

	const response = await request.apiClient
		.delete(`appeals/${appealId}/inquiry/${hearingId}`)
		.json();

	return response;
};
