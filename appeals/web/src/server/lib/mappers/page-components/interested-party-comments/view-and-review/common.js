import { addressToMultilineStringHtml } from '#lib/address-formatter.js';
import { dateISOStringToDisplayDate } from '#lib/dates.js';
import { buildHtmUnorderedList } from '#lib/nunjucks-template-builders/tag-builders.js';
import { COMMENT_STATUS } from '@pins/appeals/constants/common.js';

/** @typedef {import("../../../../../appeals/appeal-details/interested-party-comments/interested-party-comments.types.js").Representation} Representation */

/**
 * Generates the withdraw link component.
 * @returns {PageComponent} The withdraw link component.
 */
export function generateWithdrawLink() {
	return {
		type: 'html',
		wrapperHtml: {
			opening: '<div class="govuk-!-margin-bottom-3">',
			closing: '</div>'
		},
		parameters: {
			html: '<a class="govuk-link" href="#">Withdraw comment</a>'
		}
	};
}

/**
 * Generates the comment summary list used in both view and review pages.
 * @param {number} appealId
 * @param {Representation} comment - The comment object.
 * @param {{ isReviewPage?: boolean }} [options]
 * @returns {PageComponent} The generated comment summary list component.
 */
export function generateCommentSummaryList(
	appealId,
	comment,
	{ isReviewPage } = { isReviewPage: false }
) {
	const hasAddress =
		comment.represented.address &&
		comment.represented.address.addressLine1 &&
		comment.represented.address.postCode;

	const commentIsDocument = !comment.originalRepresentation && comment.attachments?.length > 0;

	const attachmentsList =
		comment.attachments.length > 0
			? buildHtmUnorderedList(
					comment.attachments.map((a) => `<a href="#">${a.documentVersion.document.name}</a>`)
			  )
			: null;

	const rows = [
		{
			key: { text: 'Interested party' },
			value: { text: comment.represented.name }
		},
		{
			key: { text: 'Email' },
			value: { text: comment.represented.email }
		},
		{
			key: { text: 'Address' },
			value: hasAddress
				? { html: addressToMultilineStringHtml(comment.represented.address) }
				: { text: 'Not provided' },
			actions: {
				items: [
					{
						text: hasAddress ? 'Change' : 'Add',
						href: `/appeals-service/appeal-details/${appealId}/interested-party-comments/${comment.id}/edit/address?review=${isReviewPage}`,
						visuallyHiddenText: 'address'
					}
				]
			}
		},
		...(isReviewPage
			? []
			: [
					{
						key: { text: 'Site visit requested' },
						value: { text: comment.siteVisitRequested ? 'Yes' : 'No' }
					}
			  ]),
		{
			key: { text: 'Submitted' },
			value: { html: dateISOStringToDisplayDate(comment.created) }
		},
		{
			key: { text: comment.redactedRepresentation ? 'Original comment' : 'Comment' },
			value: {
				text: commentIsDocument ? 'Added as a document' : comment.originalRepresentation
			},
			actions: {
				items: commentIsDocument ? [] : [{ text: 'Redact', href: '#' }]
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
						? [{ text: 'Manage', href: '#', visuallyHiddenText: 'supporting documents' }]
						: []),
					{ text: 'Add', href: '#', visuallyHiddenText: 'supporting documents' }
				]
			}
		},
		...(isReviewPage || comment.status !== COMMENT_STATUS.INVALID
			? []
			: [
					{
						key: { text: 'Why comment invalid' },
						value: { text: comment.notes }
					}
			  ])
	];

	return {
		type: 'summary-list',
		parameters: { rows }
	};
}
