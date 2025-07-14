/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {{startDate: string, estimatedDays?: string, inquiryStartTime: string, lpaQuestionnaireDueDate: string, statementDueDate: string, ipCommentsDueDate: string, statementOfCommonGroundDueDate: string, proofOfEvidenceAndWitnessesDueDate: string, planningObligationDueDate: string, address?: {addressLine1: string, addressLine2?: string, town: string, county?: string, postcode: string}}} inquiryDetails
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
