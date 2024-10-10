/** @typedef {import('@pins/appeals.api').Schema.CaseNote} CaseNote */

/**
 *
 * @param {CaseNote[]} caseNotes
 * @returns {GetCaseNotesResponse}
 */
export const formatCaseNotes = (caseNotes) => {
	return caseNotes
		? caseNotes
				.filter((caseNote) => !caseNote.archived)
				.map((caseNote) => ({
					id: caseNote.id,
					comment: caseNote.comment,
					createdAt: caseNote.createdAt,
					azureAdUserId: caseNote.user.azureAdUserId
				}))
		: [];
};
