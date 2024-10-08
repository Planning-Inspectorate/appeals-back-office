import { addressToMultilineStringHtml } from '#lib/address-formatter.js';
import { appealShortReference } from '#lib/appeals-formatter.js';
import { dateISOStringToDisplayDate } from '#lib/dates.js';

/**
 * @typedef {import('@pins/appeals.api').Appeals.SingleAppellantCaseResponse} SingleAppellantCaseResponse */
/** @typedef {import('#appeals/appeal-details/interested-party-comments/interested-party-comments.types').Representation} IPComments */
/** @typedef {import('#appeals/appeal-details/interested-party-comments/interested-party-comments.types').RepresentationList} IPCommentsList */
/** @typedef {import("../appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {import("./interested-party-comments.types.js").Representation} Representation */

/**
 *
 * @param {Appeal} appealDetails
 * @param {IPCommentsList} awaitingReview
 * @param {IPCommentsList} valid
 * @param {IPCommentsList} invalid
 * @returns {Promise<PageContent>}
 */
export async function interestedPartyCommentsPage(appealDetails, awaitingReview, valid, invalid) {
	const appealUrl = `/appeals-service/appeal-details/${appealDetails.appealId}`;
	const shortReference = appealShortReference(appealDetails.appealReference);
	const pageContent = {
		title: `Interested Party Comments`,
		backLinkUrl: appealUrl,
		addCommentUrl: `${appealUrl}/interested-party-comments/add`,
		preHeading: `Appeal ${shortReference}`,
		heading: 'Interested Party Comments',
		headingClasses: 'govuk-heading-l',
		pageComponents: [],
		awaitingReviewTable: createTable(awaitingReview, true),
		validTable: createTable(valid, false),
		invalidTable: createTable(invalid, false)
	};

	return pageContent;
}

/**
 * Creates a table object for the interested party comments.
 * @param {IPCommentsList} commentsData - The comments data including items and metadata.
 * @param {boolean} isReview - Whether the table is for comments awaiting review.
 * @returns {Object} The table object or an empty object if there are no items.
 */
function createTable(commentsData, isReview = false) {
	return commentsData.itemCount > 0
		? {
				head: [{ text: 'Interested party' }, { text: 'Submitted' }, { text: 'Action' }],
				rows: generateTableRows(commentsData.items, isReview)
		  }
		: {};
}

/**
 * Generates table rows for the interested party comments.
 * @param {Array<IPComments>} items - List of comments to generate rows for.
 * @param {boolean} isReview - Whether the table is for comments awaiting review.
 * @returns {Array<Array<{text?: string, html?: string}>>} The formatted table rows.
 */
function generateTableRows(items, isReview = false) {
	return items.map((comment) => [
		{ text: comment.author },
		{ text: dateISOStringToDisplayDate(comment.created) },
		{
			html: `<a href="./interested-party-comments/${comment.id}/${isReview ? 'review' : 'view'}">${
				isReview ? 'Review' : 'View'
			}<span class="govuk-visually-hidden"> interested party comments from ${
				comment.author
			}</span></a>`
		}
	]);
}

/**
 * @param {Appeal} appealDetails
 * @param {Representation} comment
 * @returns {PageContent}
 * */
export function viewInterestedPartyCommentPage(appealDetails, comment) {
	const shortReference = appealShortReference(appealDetails.appealReference);

	const attachmentsList = (() => {
		if (comment.attachments.length === 0) {
			return null;
		}

		const items = comment.attachments.map((a) => `<li>${a.documentVersion.document.name}</li>`);
		return `<ul class="govuk-list govuk-list--bullet">${items.join('')}</ul>`;
	})();

	const hasAddress =
		comment.represented.address &&
		comment.represented.address.addressLine1 &&
		comment.represented.address.postCode;

	const commentText = (() => {
		if (comment.originalRepresentation) {
			return comment.originalRepresentation;
		}

		if (comment.attachments?.length > 0) {
			return 'Added as document';
		}
	})();

	/** @type {PageComponent} */
	const commentSummaryList = {
		type: 'summary-list',
		parameters: {
			rows: [
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
							hasAddress
								? {
										text: 'Change',
										href: '#',
										visuallyHiddenText: 'address'
								  }
								: {
										text: 'Add',
										href: '#',
										visuallyHiddenText: 'address'
								  }
						]
					}
				},
				{
					key: { text: 'Site visit requested' },
					value: { text: '' }
				},
				{
					key: { text: 'Submitted date' },
					value: { html: dateISOStringToDisplayDate(comment.created) }
				},
				{
					key: { text: comment.redactedRepresentation ? 'Original comment' : 'Comment' },
					value: { text: commentText },
					actions: {
						items: [
							{
								text: 'Redact',
								href: '#'
							}
						]
					}
				},
				...(comment.redactedRepresentation
					? [
							{
								key: { text: 'Redacted comment' },
								value: { text: comment.redactedRepresentation }
							}
					  ]
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
											href: '#',
											visuallyHiddenText: 'supporting documents'
										}
								  ]
								: []),
							{
								text: 'Add',
								href: '#',
								visuallyHiddenText: 'supporting documents'
							}
						]
					}
				},
				...(comment.status === 'invalid'
					? [
							{
								key: { text: 'Why comment invalid' },
								value: { text: comment.notes }
							}
					  ]
					: [])
			]
		}
	};

	/** @type {PageComponent} */
	const withdrawLink = {
		type: 'html',
		parameters: {
			html: '<a class="govuk-link" href="#">Withdraw comment</a>'
		}
	};

	const pageContent = {
		title: 'View comment',
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}/interested-party-comments`,
		preHeading: `Appeal ${shortReference}`,
		heading: 'View comment',
		headingClasses: 'govuk-heading-l',
		pageComponents: [commentSummaryList, withdrawLink]
	};

	return pageContent;
}
