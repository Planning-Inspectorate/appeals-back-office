import {
	dateISOStringToDisplayDate,
	dateISOStringToDisplayTime12hr,
	getDayFromISODate
} from '#lib/dates.js';
import { tryMapUsers } from '#appeals/appeal-details/audit/audit.mapper.js';

/** @typedef {import('@pins/appeals.api/src/server/endpoints/appeals').GetCaseNotesResponse} GetCaseNotesResponse */
/**
 *
 * @param {GetCaseNotesResponse} unmappedCaseNotes
 * @param {import('express-session').Session & Partial<import('express-session').SessionData>}session
 * @returns {Promise<CaseNotesProperties>}
 */
export const caseNotesWithMappedUsers = async (unmappedCaseNotes, session) => {
	const caseNotes = [...unmappedCaseNotes];

	return {
		sessionComment: session.comment || '',
		caseNotes: await Promise.all(
			caseNotes.map(async (caseNote) => {
				return {
					date: dateISOStringToDisplayDate(caseNote.createdAt),
					dayOfWeek: getDayFromISODate(caseNote.createdAt),
					time: dateISOStringToDisplayTime12hr(caseNote.createdAt),
					commentText: caseNote.comment,
					userName: (await tryMapUsers(caseNote.azureAdUserId, session)).split('@')[0]
				};
			})
		)
	};
};
