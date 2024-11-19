/** @typedef {import('@pins/appeals.api/src/server/endpoints/appeals').GetCaseNotesResponse} GetCaseNotesResponse */

import { caseNotesWithMappedUsers } from './case-notes.formatter.js';

/**
 * @param {GetCaseNotesResponse} appealCaseNotes
 * @param {import('@pins/express/types/express.js').Request} request
 * @returns {Promise<PageComponent>}
 */
export const generateCaseNotes = async (appealCaseNotes, request) => {
	const mappedCaseNotes = await caseNotesWithMappedUsers(appealCaseNotes, request.session);

	return {
		type: 'details',
		parameters: {
			summaryText: `${mappedCaseNotes.caseNotes.length} case note${
				mappedCaseNotes.caseNotes.length === 1 ? '' : 's'
			}`,
			html: '',
			pageComponents: [
				{
					type: 'case-notes',
					parameters: {
						caseNotes: mappedCaseNotes.caseNotes,
						sessionComment: mappedCaseNotes.sessionComment
					}
				}
			]
		}
	};
};
