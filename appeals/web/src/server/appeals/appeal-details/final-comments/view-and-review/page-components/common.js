import { buildHtmUnorderedList } from '#lib/nunjucks-template-builders/tag-builders.js';
import { preRenderPageComponents } from '#lib/nunjucks-template-builders/page-component-rendering.js';

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
 * @returns {PageComponent} The generated comment summary list component.
 */
export function generateCommentsSummaryList(appealId, comment) {
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

	const commentTypePath = mapRepresentationTypeToPath(comment.representationType);

	const rows = [
		{
			key: { text: comment.redactedRepresentation ? 'Original final comments' : 'Final comments' },
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
