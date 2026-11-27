import {
	mapDocumentDownloadUrl,
	mapDocumentSizeToFileSizeString
} from '#appeals/appeal-documents/appeal-documents.mapper.js';
import { dateISOStringToDisplayDate } from '#lib/dates.js';
import { preRenderPageComponents } from '#lib/nunjucks-template-builders/page-component-rendering.js';
import { getDocumentDisplayRedactionStatus } from '#lib/redaction-statuses.js';

/** @typedef {import("../../../appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {import('#appeals/appeal-details/representations/types.js').Representation} Representation */

/**
 * Read-only list of an interested party comment's supporting documents
 *
 * @param {Appeal} appealDetails
 * @param {Representation} comment
 * @param {any} folder attachments folder, with documents already filtered to this comment
 * @param {string} backLinkUrl
 * @returns {PageContent}
 */
export function supportingDocumentsPage(appealDetails, comment, folder, backLinkUrl) {
	const interestedPartyName = comment.represented?.name || comment.author || '';
	const documents = folder?.documents ?? [];

	/** @type {PageComponent[]} */
	const pageComponents = [
		{
			type: 'table',
			parameters: {
				attributes: { id: 'supporting-documents-table' },
				head: [{ text: 'Name' }, { text: 'Date received' }, { text: 'Redaction status' }],
				rows: documents.map((/** @type {any} */ document, /** @type {number} */ i) => {
					const fileSizeString = document.latestDocumentVersion?.size
						? `(${mapDocumentSizeToFileSizeString(Number(document.latestDocumentVersion?.size))})`
						: '';

					return [
						{
							html: `${i + 1}. <a class="govuk-link" href="${mapDocumentDownloadUrl(
								folder.caseId,
								document.id,
								document.name
							)}" target="_blank">${document.name || ''}</a> ${fileSizeString}`.trim()
						},
						{ text: dateISOStringToDisplayDate(document.latestDocumentVersion?.dateReceived) },
						{ text: getDocumentDisplayRedactionStatus(document, folder.path) }
					];
				})
			}
		}
	];

	preRenderPageComponents(pageComponents);

	return {
		title: 'Supporting documents',
		backLinkUrl,
		preHeading: 'Supporting documents',
		heading: `Interested party ${interestedPartyName} documents`,
		pageComponents
	};
}
