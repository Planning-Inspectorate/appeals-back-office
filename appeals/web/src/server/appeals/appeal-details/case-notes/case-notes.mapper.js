/** @typedef {import('@pins/appeals.api/src/server/endpoints/appeals').GetCaseNotesResponse} GetCaseNotesResponse */

import { textInputCharacterLimits } from '#appeals/appeal.constants.js';
import { caseNotesWithMappedUsers } from './case-notes.formatter.js';

/**
 * @param {GetCaseNotesResponse} appealCaseNotes
 * @param {import('@pins/express/types/express.js').Request} request
 * @returns {Promise<PageComponent>}
 */
export const generateCaseNotes = async (appealCaseNotes, request) => {
	const mappedCaseNotes = await caseNotesWithMappedUsers(
		appealCaseNotes,
		request.session,
		request.apiClient
	);

	return {
		type: 'details',
		wrapperHtml: {
			opening: '<div class="govuk-grid-row"><div class="govuk-grid-column-full">',
			closing: '</div></div>'
		},
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
						sessionComment: mappedCaseNotes.sessionComment,
						characterLimit: textInputCharacterLimits.caseNoteTextInputLength
					}
				}
			]
		}
	};
};
