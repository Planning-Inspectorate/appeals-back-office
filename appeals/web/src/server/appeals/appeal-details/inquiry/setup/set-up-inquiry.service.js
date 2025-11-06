import { getAppellantCaseFromAppealId } from '#appeals/appeal-details/appellant-case/appellant-case.service.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {{startDate: string, estimatedDays?: string, inquiryStartTime: string, lpaQuestionnaireDueDate: string, statementDueDate: string, ipCommentsDueDate: string, statementOfCommonGroundDueDate: string, proofOfEvidenceAndWitnessesDueDate: string, planningObligationDueDate?: string, isStartCase: boolean, address?: {addressLine1: string, addressLine2?: string, town: string, county?: string, postcode: string}}} inquiryDetails
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
 * @param {{estimatedDays?: string, addressId?: number, inquiryStartTime: string, address?: {addressLine1: string, addressLine2?: string, town: string, county?: string, postcode: string} | null}} inquiryDetails
 * @returns {Promise<{inquiryId: number}>}
 */
export const updateInquiry = async (request, inquiryDetails) => {
	const { appealId, inquiry } = request.currentAppeal;
	return await request.apiClient
		.patch(`appeals/${appealId}/inquiry/${inquiry.inquiryId}`, {
			json: inquiryDetails
		})
		.json();
};

/**
 * @param {import('@pins/express/types/express.js').Request} req
 */
export const addAppellantCaseToLocals = async (req) => {
	return getAppellantCaseFromAppealId(
		req.apiClient,
		req.currentAppeal.appealId,
		req.currentAppeal.appellantCaseId
	);
};
