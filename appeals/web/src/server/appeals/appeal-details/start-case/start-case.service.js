/** @typedef {import('#appeals/appeal-details/appeal-details.types').WebAppeal} Appeal */

/**
 * @typedef {Object} CalculateAppealTimetableResponse
 * @property {string?} [lpaQuestionnaireDueDate]
 * @property {string?} [ipCommentsDueDate]
 * @property {string?} [lpaStatementDueDate]
 * @property {string?} [finalCommentsDueDate]
 * @property {string?} [s106ObligationDueDate]
 * @property {string?} [statementOfCommonGroundDueDate]
 * @property {string?} [planningObligationDueDate]
 * @property {string?} [proofOfEvidenceAndWitnessesDueDate]
 * @property {string?} [caseManagementConferenceDueDate]
 * @property {string?} [startDate]
 */

/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} dateISOString
 * @param {string} [procedureType]
 * @param {string} [hearingStartTime]
 * @returns {Promise<Appeal>}
 */
export async function setStartDate(
	apiClient,
	appealId,
	dateISOString,
	procedureType,
	hearingStartTime
) {
	return await apiClient
		.post(`appeals/${appealId}/appeal-timetables`, {
			json: {
				startDate: dateISOString,
				...(procedureType && { procedureType }),
				...(hearingStartTime && { hearingStartTime })
			}
		})
		.json();
}

/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} [startDate]
 * @param {string} [procedureType]
 * @param {string} [hearingStartTime]
 * @param {any} [inquiry]
 * @returns {Promise<{appellant?: string, lpa?: string}>}
 */
export async function getStartCaseNotifyPreviews(
	apiClient,
	appealId,
	startDate,
	procedureType,
	hearingStartTime,
	inquiry
) {
	const result = await apiClient
		.post(`appeals/${appealId}/appeal-timetables/notify-preview`, {
			json: {
				...(startDate && { startDate }),
				...(procedureType && { procedureType }),
				...(hearingStartTime && { hearingStartTime }),
				...(inquiry && { inquiry })
			}
		})
		.json();

	if (result.error) {
		throw new Error(result.error);
	}

	return result;
}

/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} [procedureType]
 * @param {string} [dateString]
 * @returns {Promise<CalculateAppealTimetableResponse>}
 */
export async function calculateAppealTimetable(apiClient, appealId, procedureType, dateString) {
	return await apiClient
		.get(`appeals/${appealId}/appeal-timetables/calculate`, {
			searchParams: {
				startDate: dateString,
				...(procedureType && { procedureType })
			}
		})
		.json();
}
