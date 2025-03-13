import { buildHtmUnorderedList } from '#lib/nunjucks-template-builders/tag-builders.js';

/** @typedef {import("#appeals/appeal-details/appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {import("#appeals/appeal-details/representations/types.js").Representation} Representation */

/**
 * @param {Appeal} appealDetails
 * @param {Representation} comment
 * @param {string} finalCommentsType
 * @returns {PageComponent}
 */
export const summaryList = (appealDetails, comment, finalCommentsType) => {
	const filteredAttachments = comment.attachments?.filter(
		(attachment) => !attachment.documentVersion.document.isDeleted
	);

	const attachmentsList = filteredAttachments?.length
		? buildHtmUnorderedList(
				filteredAttachments.map(
					(a) => `<a class="govuk-link" target="_blank" href="${mapDocumentDownloadUrl(
						appealDetails.appealId,
						a.documentId,
						a.documentVersion.document.name
					)}">
						${a.documentVersion.document.name}
					</a>`
				)
		  )
		: null;

	/** @type {PageComponent} */
	return {
		type: 'summary-list',
		wrapperHtml: {
			opening: '<div class="govuk-grid-row"><div class="govuk-grid-column-full">',
			closing: '</div></div>'
		},
		parameters: {
			rows: [
				{
					key: { text: 'Original final comments' },
					value: {
						html: '',
						pageComponents: [
							{
								type: 'show-more',
								parameters: {
									text: comment.originalRepresentation,
									labelText: 'Read more'
								}
							}
						]
					}
				},
				{
					key: { text: 'Supporting documents' },
					value: attachmentsList ? { html: attachmentsList } : { text: 'Not provided' },
					...(comment.attachments?.length > 0
						? {
								actions: {
									items: [
										{
											text: 'Change',
											href: `/appeals-service/appeal-details/${appealDetails.appealId}/final-comments/${finalCommentsType}/manage-documents/${comment.attachments?.[0]?.documentVersion?.document?.folderId}`
										}
									]
								}
						  }
						: {})
				},
				{
					key: { text: 'Review decisions' },
					value: { text: 'Accept final comments' },
					actions: {
						items: [
							{
								text: 'Change',
								href: `/appeals-service/appeal-details/${appealDetails.appealId}/final-comments/${finalCommentsType}/`
							}
						]
					}
				}
			]
		}
	};
};

/**
 * @param {Number} appealId
 * @param {string} documentId
 * @param {string} documentName
 * @returns {string}
 */
const mapDocumentDownloadUrl = (appealId, documentId, documentName) => {
	return `/documents/${appealId}/download/${documentId}/${documentName}`;
};
