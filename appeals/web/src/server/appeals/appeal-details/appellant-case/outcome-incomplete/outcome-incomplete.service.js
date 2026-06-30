import { dayMonthYearHourMinuteToISOString } from '#lib/dates.js';
import { assertValidNumericIds } from '#lib/validators/api-parameters.validator.js';
import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
import { DEADLINE_HOUR, DEADLINE_MINUTE } from '@pins/appeals/constants/dates.js';
import {
	beforeExpeditedOriginalApplicationCutOff,
	isS78ExpeditedAppealType
} from '@pins/appeals/utils/appeal-type-checks.js';

/**
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
		...(reviewOutcome.enforcementGroundsMismatchText?.length && {
			enforcementGroundsMismatchFacts: reviewOutcome.enforcementGroundsMismatchText
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
	const ids = assertValidNumericIds({ appealId, appellantCaseId });
	return apiClient
		.patch(`appeals/${ids.appealId}/appellant-cases/${ids.appellantCaseId}`, {
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

/**
 * @param {Array<{id: number, name: string, hasText: Boolean}>} incompleteReasonOptions
 * @param {string} appealType
 * @param {import('@pins/appeals.api').Appeals.SingleAppellantCaseResponse | undefined} appellantCase
 * @returns {Array<{id: number, name: string, hasText: Boolean}>}
 */
export function getFilteredReasons(incompleteReasonOptions, appealType, appellantCase) {
	let isExpedited;
	switch (appealType) {
		case APPEAL_TYPE.S78:
		case APPEAL_TYPE.S78_EXPEDITED:
			isExpedited = isS78ExpeditedAppealType(
				appealType,
				appellantCase?.applicationDate,
				appellantCase?.applicationDecision,
				appellantCase?.typeOfPlanningApplication
			);
			if (isExpedited) {
				return incompleteReasonOptions.filter(
					(reason) => (reason.id !== 2 && reason.id <= 10) || reason.id === 11
				);
			} else {
				return incompleteReasonOptions.filter((reason) => reason.id <= 10 || reason.id === 11);
			}
		case APPEAL_TYPE.ENFORCEMENT_LISTED_BUILDING:
			return incompleteReasonOptions.filter(
				(reason) => reason.id > 9 && reason.id !== 11 && reason.id !== 14
			);
		case APPEAL_TYPE.ENFORCEMENT_NOTICE:
			return incompleteReasonOptions.filter((reason) => reason.id > 9 && reason.id !== 11);
		case APPEAL_TYPE.CAS_ADVERTISEMENT:
		case APPEAL_TYPE.CAS_PLANNING:
		case APPEAL_TYPE.HOUSEHOLDER:
			if (beforeExpeditedOriginalApplicationCutOff(appellantCase?.applicationDate)) {
				return incompleteReasonOptions.filter((reason) => reason.id <= 10 || reason.id === 11);
			} else {
				return incompleteReasonOptions.filter(
					(reason) => (reason.id <= 10 || reason.id === 11) && reason.id !== 9 && reason.id !== 2
				);
			}
		default:
			return incompleteReasonOptions.filter((reason) => reason.id <= 10 || reason.id === 11);
	}
}
