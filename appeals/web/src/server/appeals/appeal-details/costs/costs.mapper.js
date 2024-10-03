import { appealShortReference } from '#lib/appeals-formatter.js';
import { addDocumentsCheckAndConfirmPage } from '#appeals/appeal-documents/appeal-documents.mapper.js';

/**
 *
 * @param {import('../appeal-details.types.js').WebAppeal} appealDetails
 * @param {import('@pins/appeals.api').Appeals.FolderInfo} decisionDocumentFolder
 * @param {import('#appeals/appeal-documents/appeal-documents.types').FileUploadInfoItem[]} uncommittedFiles
 * @param {import('@pins/appeals.api').Schema.DocumentRedactionStatus[]} redactionStatuses
 * @param {string} [documentId]
 * @returns {PageContent}
 */
export function decisionCheckAndConfirmPage(
	appealDetails,
	decisionDocumentFolder,
	uncommittedFiles,
	redactionStatuses,
	documentId
) {
	const shortAppealReference = appealShortReference(appealDetails.appealReference);
	const addDocumentDetailsPageUrl = `/appeals-service/appeal-details/${appealDetails.appealId}/costs/decision/add-document-details/${decisionDocumentFolder.folderId}`;

	/** @type {PageContent} */
	const pageContent = addDocumentsCheckAndConfirmPage(
		addDocumentDetailsPageUrl,
		`/appeals-service/appeal-details/${appealDetails.appealId}/costs/decision/upload-documents/${decisionDocumentFolder.folderId}`,
		addDocumentDetailsPageUrl,
		addDocumentDetailsPageUrl,
		appealDetails.appealReference,
		uncommittedFiles,
		redactionStatuses,
		undefined,
		undefined,
		`Check your answers - ${shortAppealReference}`,
		documentId ? 'Updated costs decision' : 'Costs decision'
	);

	pageContent.pageComponents?.push(
		{
			type: 'warning-text',
			parameters: {
				text: 'You must email the relevant parties to inform them of the decision.'
			}
		},
		{
			type: 'checkboxes',
			parameters: {
				name: 'confirm',
				items: [
					{
						text: 'I will email the relevant parties',
						value: 'yes'
					}
				]
			}
		}
	);

	return pageContent;
}
