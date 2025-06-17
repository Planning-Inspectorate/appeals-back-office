/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {{inquiryStartTime: string, address?: {addressLine1: string, addressLine2?: string, town: string, county?: string, postcode: string}}} hearingDetails
 * @returns {Promise<{hearingEstimateId: number}>}
 */
export const createInquiry = async (request, hearingDetails) => {
	const { appealId } = request.currentAppeal;

	const response = await request.apiClient
		.post(`appeals/${appealId}/inquiry`, {
			json: hearingDetails
		})
		.json();

	return response;
};
