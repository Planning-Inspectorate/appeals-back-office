/**
 * @typedef {Object} AppealTimetables
 * @property {string?} [lpaQuestionnaireDueDate]
 * @property {string?} [ipCommentsDueDate]
 * @property {string?} [appellantStatementDueDate]
 * @property {string?} [lpaStatementDueDate]
 * @property {string?} [finalCommentsDueDate]
 * @property {string?} [s106ObligationDueDate]
 * @property {string?} [statementOfCommonGroundDueDate]
 * @property {string?} [planningObligationDueDate]
 * @property {string?} [proofOfEvidenceAndWitnessesDueDate]
 * @property {object | string | undefined} [errors]
 */

/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} appealTimetableId
 * @param {AppealTimetables} appealTimetables
 * @returns {Promise<AppealTimetables>}
 */
export function setAppealTimetables(apiClient, appealId, appealTimetableId, appealTimetables) {
	return apiClient
		.patch(`appeals/${appealId}/appeal-timetables/${appealTimetableId}`, { json: appealTimetables })
		.json()
		.catch((error) => error?.response?.body || error);
}
