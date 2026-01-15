/**
 * @param {import('got').Got} apiClient
 * @param {number} appealId
 */
export async function getInvalidStatusCreatedDate(apiClient, appealId) {
	return apiClient.get(`appeals/${appealId}/appeal-status/invalid/created-date`).json();
}

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
				validationOutcome: 'invalid',
				enforcementInvalidReasons: reviewOutcome.enforcementNoticeReason?.map(
					(/** @type {Object<string, string[]>} */ reason) => ({
						id: reason.reasonSelected,
						text: [reason.reasonText]
					})
				),
				enforcementNoticeInvalid: reviewOutcome.enforcementNoticeInvalid,
				otherInformation:
					reviewOutcome.otherInformationDetails ?? reviewOutcome.otherInformationValidRadio
			}
		})
		.json();
}
