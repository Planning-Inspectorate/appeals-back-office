import { buildHtmUnorderedList } from '#lib/nunjucks-template-builders/tag-builders.js';

/** @typedef {import('#appeals/appeal-details/representations/types.js').Representation} Representation */

/**
 * Generates the comment summary list used in both view and review pages.
 * @param {number} appealId
 * @param {Representation} comment - The comment object.
 * @param {string} finalCommentsType
 * @returns {PageComponent} The generated comment summary list component.
 */
export function generateCommentsSummaryList(appealId, comment, finalCommentsType) {
	const commentIsDocument = !comment.originalRepresentation && comment.attachments?.length > 0;
	const folderId = comment.attachments?.[0]?.documentVersion?.document?.folderId ?? null;

	const attachmentsList =
		comment.attachments.length > 0
			? buildHtmUnorderedList(
					comment.attachments.map(
						(a) => `<a class="govuk-link" href="#">${a.documentVersion.document.name}</a>`
					)
			  )
			: null;

	console.log('comment:');
	console.log(comment);
	console.log('attachmentsList:');
	console.log(attachmentsList);

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
		{
			key: { text: 'Supporting documents' },
			value: attachmentsList ? { html: attachmentsList } : { text: 'Not provided' },
			actions: {
				items: [
					...(comment.attachments?.length > 0
						? [
								{
									text: 'Manage',
									href: `/appeals-service/appeal-details/${appealId}/final-comments/${finalCommentsType}/supporting-documents/manage-documents/${folderId}`,
									visuallyHiddenText: 'supporting documents'
								}
						  ]
						: []),
					{
						text: 'Add',
						href: `/appeals-service/appeal-details/${appealId}/final-comments/${finalCommentsType}/supporting-documents/add-documents`,
						visuallyHiddenText: 'supporting documents'
					}
				]
			}
		}
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
