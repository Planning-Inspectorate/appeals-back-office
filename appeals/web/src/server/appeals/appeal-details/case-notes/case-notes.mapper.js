/** @typedef {import('@pins/appeals.api/src/server/endpoints/appeals').GetCaseNotesResponse} GetCaseNotesResponse */

import { caseNotesWithMappedUsers } from './case-notes.formatter.js';

/**
 * @param {GetCaseNotesResponse} appealCaseNotes
 * @param {import('@pins/express/types/express.js').Request} request
 * @returns {Promise<PageComponent>}
 */
export const generateCaseNotes = async (appealCaseNotes, request) => {
	const caseNotes = await caseNotesWithMappedUsers(appealCaseNotes, request.session);

	return {
		type: 'details',
		parameters: {
			summaryText: `${caseNotes.length} case note${caseNotes.length === 1 ? '' : 's'}`,
			html: '',
			pageComponents: [
				{
					type: 'case-notes',
					parameters: {
						caseNotes: caseNotes
					}
				}
			]
		}
	};
};
