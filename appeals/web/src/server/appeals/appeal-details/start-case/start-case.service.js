/** @typedef {import('#appeals/appeal-details/appeal-details.types').WebAppeal} Appeal */

/**
 * @typedef {Object} CalculateAppealTimetableResponse
 * @property {string?} [lpaQuestionnaireDueDate]
 * @property {string?} [ipCommentsDueDate]
 * @property {string?} [appellantStatementDueDate]
 * @property {string?} [lpaStatementDueDate]
 * @property {string?} [finalCommentsDueDate]
 * @property {string?} [s106ObligationDueDate]
 * @property {string?} [statementOfCommonGroundDueDate]
 * @property {string?} [planningObligationDueDate]
 * @property {string?} [proofOfEvidenceAndWitnessesDueDate]
 * @property {string?} [startDate]
 */

/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} dateISOString
 * @param {string} [procedureType]
 * @returns {Promise<Appeal>}
 */
export async function setStartDate(apiClient, appealId, dateISOString, procedureType) {
	return await apiClient
		.post(`appeals/${appealId}/appeal-timetables`, {
			json: {
				startDate: dateISOString,
				...(procedureType && { procedureType })
			}
		})
		.json();
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
