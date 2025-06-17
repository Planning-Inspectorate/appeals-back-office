/**
 * @typedef {object} InquiryAddress
 * @property {string} addressLine1
 * @property {string} addressLine2
 * @property {string} town
 * @property {string} county
 * @property {string} postcode
 */

/**
 * @typedef {object} InquiryDetails
 * @property {string} inquiryStartTime
 * @property {InquiryAddress} address
 */

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {InquiryDetails} inquiryDetails
 * @returns {Promise<{inquiryEstimateId: number}>}
 */
export const createInquiry = async (request, inquiryDetails) => {
	const { appealId } = request.currentAppeal;

	return await request.apiClient
		.post(`appeals/${appealId}/inquiry`, {
			json: inquiryDetails
		})
		.json();
};
