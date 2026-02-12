import { dayMonthYearHourMinuteToISOString } from '#lib/dates.js';
import { DEADLINE_HOUR, DEADLINE_MINUTE } from '@pins/appeals/constants/dates.js';

/**e
 * @param {import('got').Got} apiClient
 * @returns {Promise<any>}
 */
export async function getAppellantCaseEnforcementMissingDocuments(apiClient) {
	return apiClient.get(`appeals/appellant-case-enforcement-missing-documents`).json();
}
/**e
 * @param {import('got').Got} apiClient
 * @returns {Promise<any>}
 */
export async function getAppellantCaseEnforcementGroundsMismatch(apiClient) {
	return apiClient.get(`appeals/appellant-case-enforcement-grounds-mismatch-facts`).json();
}
const mapIncompleteReviewOutcomeApiResponse = (/** @type {any} */ reviewOutcome) => {
	let parsedReasons;
	let missingDocumentReasons;
	if (reviewOutcome.reasons) {
		const reasons = !Array.isArray(reviewOutcome.reasons)
			? [reviewOutcome.reasons]
			: reviewOutcome.reasons;
		// @ts-ignore
		parsedReasons = reasons.map((reason) => parseInt(reason, 10));
		// @ts-ignore
		if (!parsedReasons.every((value) => !Number.isNaN(value))) {
			throw new Error('failed to parse one or more invalid reason IDs to integer');
		}
	}
	if (reviewOutcome.missingDocuments) {
		const reasons = !Array.isArray(reviewOutcome.missingDocuments)
			? [reviewOutcome.missingDocuments]
			: reviewOutcome.missingDocuments;
		// @ts-ignore
		missingDocumentReasons = reasons.map((reason) => parseInt(reason, 10));
		// @ts-ignore
		if (!missingDocumentReasons.every((value) => !Number.isNaN(value))) {
			throw new Error('failed to parse one or more missing document IDs to integer');
		}

		return {
			...(reviewOutcome.missingDocuments && {
				// @ts-ignore
				enforcementMissingDocuments: missingDocumentReasons.map((reason) => ({
					id: reason,
					...(reviewOutcome.missingDocumentsText &&
						reviewOutcome.missingDocumentsText[reason] && {
							text: reviewOutcome.missingDocumentsText[reason]
						})
				}))
			}),
			...(reviewOutcome.reasons && {
				// @ts-ignore
				incompleteReasons: parsedReasons.map((reason) => ({
					id: reason,
					...(reviewOutcome.reasonsText &&
						reviewOutcome.reasonsText[reason] && {
							text: reviewOutcome.reasonsText[reason]
						})
				}))
			}),
			...(reviewOutcome.updatedDueDate && {
				appealDueDate: dayMonthYearHourMinuteToISOString({
					...reviewOutcome.updatedDueDate,
					hour: DEADLINE_HOUR,
					minute: DEADLINE_MINUTE
				})
			}),
			...(reviewOutcome.feeReceiptDueDate && {
				feeReceiptDueDate: dayMonthYearHourMinuteToISOString({
					...reviewOutcome.feeReceiptDueDate,
					hour: DEADLINE_HOUR,
					minute: DEADLINE_MINUTE
				})
			})
		};
	}
};
/**
 * @param {import('got').Got} apiClient
 * @param {number|string} appealId
 * @param {number} appellantCaseId
 * @param {any} reviewOutcome
 * @returns {Promise<import('@pins/appeals.api').Appeals.SingleAppellantCaseResponse>}
 */
export async function setReviewOutcomeForEnforcementNoticeAppellantCase(
	apiClient,
	appealId,
	appellantCaseId,
	reviewOutcome
) {
	return apiClient
		.patch(`appeals/${appealId}/appellant-cases/${appellantCaseId}`, {
			json: {
				validationOutcome: reviewOutcome.validationOutcome,
				enforcementNoticeInvalid: reviewOutcome.enforcementNoticeInvalid,
				...(reviewOutcome.enforcementNoticeReason?.length && {
					enforcementInvalidReasons: reviewOutcome.enforcementNoticeReason?.map(
						(/** @type {Object<string, string[]>} */ reason) => ({
							id: reason.reasonSelected,
							text: [reason.reasonText]
						})
					)
				}),
				...(reviewOutcome.otherInformationValidRadio && {
					otherInformation:
						reviewOutcome.otherInformationDetails ?? reviewOutcome.otherInformationValidRadio
				}),
				...(reviewOutcome.enforcementGroundsMismatchText?.length && {
					enforcementGroundsMismatchFacts: reviewOutcome.enforcementGroundsMismatchText
				}),
				...(reviewOutcome.validationOutcome === 'incomplete' &&
					mapIncompleteReviewOutcomeApiResponse(reviewOutcome))
			}
		})
		.json();
}
