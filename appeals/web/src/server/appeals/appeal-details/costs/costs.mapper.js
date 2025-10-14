import { addDocumentsCheckAndConfirmPage } from '#appeals/appeal-documents/appeal-documents.mapper.js';
import { appealShortReference } from '#lib/appeals-formatter.js';

/**
 *
 * @param {import('../appeal-details.types.js').WebAppeal} appealDetails
 * @param {import('@pins/appeals.api').Appeals.FolderInfo} decisionDocumentFolder
 * @param {import('#appeals/appeal-documents/appeal-documents.types').FileUploadInfoItem[]} uncommittedFiles
 * @param {import('@pins/appeals.api').Schema.DocumentRedactionStatus[]} redactionStatuses
 * @param {string} [documentId]
 * @param {number} [documentVersion]
 * @param {string} [documentFileName]
 * @returns {PageContent}
 */
export function decisionCheckAndConfirmPage(
	appealDetails,
	decisionDocumentFolder,
	uncommittedFiles,
	redactionStatuses,
	documentId,
	documentVersion,
	documentFileName
) {
	const shortAppealReference = appealShortReference(appealDetails.appealReference);
	const addDocumentDetailsPageUrl = `/appeals-service/appeal-details/${appealDetails.appealId}/costs/decision/add-document-details/${decisionDocumentFolder.folderId}`;

	/** @type {PageContent} */
	const pageContent = addDocumentsCheckAndConfirmPage({
		backLinkUrl: addDocumentDetailsPageUrl,
		changeFileLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}/costs/decision/upload-documents/${decisionDocumentFolder.folderId}`,
		changeDateLinkUrl: addDocumentDetailsPageUrl,
		changeRedactionStatusLinkUrl: addDocumentDetailsPageUrl,
		appealReference: appealDetails.appealReference,
		uncommittedFiles,
		redactionStatuses,
		titleTextOverride: `Check your answers - ${shortAppealReference}`,
		summaryListNameLabelOverride: documentId ? 'Updated costs decision' : 'Costs decision',
		summaryListDateLabelOverride: 'Decision date',
		documentVersion,
		documentFileName
	});

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
				idPrefix: 'confirm',
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
