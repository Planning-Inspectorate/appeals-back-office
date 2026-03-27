import { dayMonthYearHourMinuteToISOString } from '#lib/dates.js';
import { DEADLINE_HOUR, DEADLINE_MINUTE } from '@pins/appeals/constants/dates.js';

/**
 * @param {import('got').Got} apiClient
 * @param {number} appealId
 */
export async function getInvalidStatusCreatedDate(apiClient, appealId) {
	return apiClient.get(`appeals/${appealId}/appeal-status/invalid/created-date`).json();
}

const mapIncompleteReviewOutcomeApiResponse = (/** @type {any} */ reviewOutcome) => {
	let parsedReasons;
	let missingDocumentReasons;
	let groundsFactsReasons;

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
	}
	if (reviewOutcome.groundsFacts) {
		const reasons = !Array.isArray(reviewOutcome.groundsFacts)
			? [reviewOutcome.groundsFacts]
			: reviewOutcome.groundsFacts;
		// @ts-ignore
		groundsFactsReasons = reasons.map((reason) => parseInt(reason, 10));
		// @ts-ignore
		if (!groundsFactsReasons.every((value) => !Number.isNaN(value))) {
			throw new Error('failed to parse one or more grounds and facts IDs to integer');
		}
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
		}),
		...(reviewOutcome.groundsFacts && {
			// @ts-ignore
			enforcementGroundsMismatchFacts: groundsFactsReasons.map((reason) => ({
				id: reason,
				...(reviewOutcome.groundsFacts &&
					reviewOutcome.groundsFactsText[reason] && {
						text: reviewOutcome.groundsFactsText[reason]
					})
			}))
		})
	};
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
				...(reviewOutcome.validationOutcome === 'incomplete' &&
					mapIncompleteReviewOutcomeApiResponse(reviewOutcome))
			}
		})
		.json();
}
