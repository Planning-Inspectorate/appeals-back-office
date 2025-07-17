import { buildHtmlList } from '#lib/nunjucks-template-builders/tag-builders.js';
import { preRenderPageComponents } from '#lib/nunjucks-template-builders/page-component-rendering.js';
import { mapDocumentDownloadUrl } from '#appeals/appeal-documents/appeal-documents.mapper.js';
import { checkRedactedText } from '#lib/validators/redacted-text.validator.js';

/** @typedef {import('#appeals/appeal-details/representations/types.js').Representation} Representation */

/**
 * Maps representation types to their respective URL path fragments.
 * @param {string} representationType
 * @returns {string}
 */
function mapRepresentationTypeToPath(representationType) {
	switch (representationType) {
		case 'appellant_final_comment':
			return 'appellant';
		case 'lpa_final_comment':
			return 'lpa';
		default:
			throw new Error(`Unsupported representation type: ${representationType}`);
	}
}

/**
 * Generates the comment summary list used in both view and review pages.
 * @param {number} appealId
 * @param {Representation} comment - The comment object.
 * @param {boolean} [isReview=false] - Indicates if the component is for review.
 * @returns {PageComponent} The generated comment summary list component.
 */
export function generateCommentsSummaryList(appealId, comment, isReview = false) {
	const commentIsDocument = !comment.originalRepresentation && comment.attachments?.length > 0;
	const folderId = comment.attachments?.[0]?.documentVersion?.document?.folderId ?? null;

	const filteredAttachments = comment.attachments?.filter((attachment) => {
		const { isDeleted, latestVersionId } = attachment?.documentVersion?.document ?? {};
		return latestVersionId === attachment.version && !isDeleted;
	});

	const attachmentsList = filteredAttachments?.length
		? buildHtmlList({
				items: filteredAttachments.map(
					(a) =>
						`<a class="govuk-link" href="${mapDocumentDownloadUrl(
							a.documentVersion.document.caseId,
							a.documentVersion.document.guid,
							a.documentVersion.document.name
						)}" target="_blank">${a.documentVersion.document.name}</a>`
				),
				isOrderedList: true,
				isNumberedList: filteredAttachments.length > 1
		  })
		: null;

	const commentTypePath = mapRepresentationTypeToPath(comment.representationType);
	const redactedCommentDifferent = checkRedactedText(
		comment.originalRepresentation,
		comment.redactedRepresentation
	);
	const rows = [
		{
			key: {
				text:
					comment.redactedRepresentation && redactedCommentDifferent
						? 'Original final comments'
						: 'Final comments'
			},
			value: commentIsDocument
				? { text: 'Added as a document' }
				: {
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
				  },
			actions: {
				items:
					(!redactedCommentDifferent || !comment.redactedRepresentation) && !isReview
						? [
								{
									text: 'Redact',
									href: `/appeals-service/appeal-details/${appealId}/final-comments/${commentTypePath}/redact`,
									visuallyHiddenText: 'final comments'
								}
						  ]
						: []
			}
		},
		...(comment.redactedRepresentation && redactedCommentDifferent
			? [
					{
						key: { text: 'Redacted comment' },
						value: {
							html: '',
							pageComponents: [
								{
									type: 'show-more',
									parameters: {
										text: comment.redactedRepresentation,
										labelText: 'Read more'
									}
								}
							]
						},
						actions: {
							items: [
								{
									text: 'Change',
									href: `/appeals-service/appeal-details/${appealId}/final-comments/${commentTypePath}/redact`,
									visuallyHiddenText: 'final comments'
								}
							]
						}
					}
			  ]
			: []),
		{
			key: { text: 'Supporting documents' },
			value: attachmentsList ? { html: attachmentsList } : { text: 'No documents' },
			actions: {
				items: [
					...(filteredAttachments?.length > 0
						? [
								{
									text: 'Manage',
									href: `/appeals-service/appeal-details/${appealId}/final-comments/${commentTypePath}/manage-documents/${folderId}`,
									visuallyHiddenText: 'supporting documents'
								}
						  ]
						: []),
					{
						text: 'Add',
						href: `/appeals-service/appeal-details/${appealId}/final-comments/${commentTypePath}/add-document`,
						visuallyHiddenText: 'supporting documents'
					}
				]
			}
		}
	];

	/** @type {PageComponent} */
	const summaryList = {
		type: 'summary-list',
		wrapperHtml: {
			opening: '<div class="govuk-grid-row"><div class="govuk-grid-column-full">',
			closing: '</div></div>'
		},
		parameters: { rows }
	};

	preRenderPageComponents([summaryList]);

	return summaryList;
}
