import { documentSummaryListItem } from '#lib/mappers/components/instructions/document.js';
import { mapRepresentationAttachmentsToDocumentInfoArray } from '#lib/mappers/data/representations/attachments.js';

/** @typedef {import('#appeals/appeal-details/representations/types.js').Representation} Representation */

/**
 * Generates the comment summary list used in both view and review pages.
 * @param {number} appealId
 * @param {Representation} comment - The comment object.
 * @param {string} finalCommentsType - appellant or LPA final comment
 * @returns {PageComponent} The generated comment summary list component.
 */
export function generateCommentsSummaryList(appealId, comment, finalCommentsType) {
	const commentIsDocument = !comment.originalRepresentation && comment.attachments?.length > 0;
	const folderId = comment.attachments?.[0]?.documentVersion?.document?.folderId ?? null;

	const supportingDocumentsRowInstruction = documentSummaryListItem({
		id: 'supporting-documents',
		text: 'Supporting documents',
		appealId,
		folderInfo: {
			folderId,
			caseId: appealId.toString(),
			path: 'representation/representationAttachments',
			documents: mapRepresentationAttachmentsToDocumentInfoArray(comment.attachments)
		},
		editable: true,
		manageUrl: `/appeals-service/appeal-details/${appealId}/final-comments/${finalCommentsType}/supporting-documents/manage-documents/${folderId}`,
		uploadUrlTemplate: `/appeals-service/appeal-details/{{appealId}}/final-comments/${finalCommentsType}/supporting-documents/add-documents`,
		noBottomMargin: true
	});

	const rows = [
		{
			key: { text: comment.redactedRepresentation ? 'Original final comments' : 'Final comments' },
			value: {
				text: commentIsDocument ? 'Added as a document' : comment.originalRepresentation
			},
			actions: {
				items: []
			}
		},
		...(comment.redactedRepresentation
			? [{ key: { text: 'Redacted comment' }, value: { text: comment.redactedRepresentation } }]
			: []),
		{ ...supportingDocumentsRowInstruction.display.summaryListItem }
	];

	return {
		type: 'summary-list',
		wrapperHtml: {
			opening: '<div class="govuk-grid-row"><div class="govuk-grid-column-full">',
			closing: '</div></div>'
		},
		parameters: { rows }
	};
}
