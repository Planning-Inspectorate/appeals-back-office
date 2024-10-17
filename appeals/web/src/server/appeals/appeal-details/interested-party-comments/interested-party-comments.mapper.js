import { addressToMultilineStringHtml } from '#lib/address-formatter.js';
import { appealShortReference } from '#lib/appeals-formatter.js';
import { dateISOStringToDisplayDate } from '#lib/dates.js';
import { buildNotificationBanners } from '#lib/mappers/notification-banners.mapper.js';
import { buildHtmUnorderedList } from '#lib/nunjucks-template-builders/tag-builders.js';
import { COMMENT_STATUS } from '@pins/appeals/constants/common.js';

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
 * @param {import('@pins/express').Session} session
 * @returns {Promise<PageContent>}
 */
export async function interestedPartyCommentsPage(
	appealDetails,
	awaitingReview,
	valid,
	invalid,
	session
) {
	const appealUrl = `/appeals-service/appeal-details/${appealDetails.appealId}`;
	const shortReference = appealShortReference(appealDetails.appealReference);

	const notificationBanners = buildNotificationBanners(
		session,
		'ipComments',
		appealDetails.appealId
	);

	const pageContent = {
		title: `Interested Party Comments`,
		backLinkUrl: appealUrl,
		addCommentUrl: `${appealUrl}/interested-party-comments/add`,
		preHeading: `Appeal ${shortReference}`,
		heading: 'Interested Party Comments',
		headingClasses: 'govuk-heading-l',
		pageComponents: [...notificationBanners],
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
			html: `<a href="./interested-party-comments/${comment.id}/${
				isReview ? 'review' : 'view'
			}" class="govuk-link">${
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
 */
export function viewInterestedPartyCommentPage(appealDetails, comment) {
	const shortReference = appealShortReference(appealDetails.appealReference);
	const commentSummaryList = generateCommentSummaryList(comment);
	const withdrawLink = generateWithdrawLink();

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

/**
 * @param {Appeal} appealDetails
 * @param {Representation} comment
 * @returns {PageContent}
 */
export function reviewInterestedPartyCommentPage(appealDetails, comment) {
	const shortReference = appealShortReference(appealDetails.appealReference);
	const commentSummaryList = generateCommentSummaryList(comment, true);
	const withdrawLink = generateWithdrawLink();

	/** @type {PageComponent} */
	const siteVisitRequestCheckbox = {
		type: 'checkboxes',
		parameters: {
			name: 'site-visit-request',
			items: [
				{
					text: 'The comment includes a site visit request',
					value: 'site-visit',
					checked: comment?.siteVisitRequested
				}
			]
		}
	};

	/** @type {PageComponent} */
	const commentValidityRadioButtons = {
		type: 'radios',
		parameters: {
			name: 'status',
			fieldset: {
				legend: {
					text: 'Do you accept the comment?',
					isPageHeading: false,
					classes: 'govuk-fieldset__legend--m'
				}
			},
			items: [
				{
					value: 'valid',
					text: 'Comment valid',
					checked: comment?.status === COMMENT_STATUS.VALID
				},
				{
					value: 'invalid',
					text: 'Comment invalid',
					checked: comment?.status === COMMENT_STATUS.INVALID
				}
			]
		}
	};

	const pageContent = {
		title: 'Review comment',
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}/interested-party-comments`,
		preHeading: `Appeal ${shortReference}`,
		heading: 'Review comment',
		headingClasses: 'govuk-heading-l',
		submitButtonText: 'Confirm',
		pageComponents: [
			commentSummaryList,
			siteVisitRequestCheckbox,
			commentValidityRadioButtons,
			withdrawLink
		]
	};

	return pageContent;
}

/**
 * Generates the withdraw link component.
 * @returns {PageComponent} The withdraw link component.
 */
function generateWithdrawLink() {
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
 * @param {Representation} comment - The comment object.
 * @returns {PageComponent} The generated comment summary list component.
 */
/**
 * Generates the comment summary list used in both view and review pages.
 * @param {Representation} comment - The comment object.
 * @returns {PageComponent} The generated comment summary list component.
 */
function generateCommentSummaryList(comment, isReviewPage = false) {
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
					hasAddress
						? { text: 'Change', href: '#', visuallyHiddenText: 'address' }
						: { text: 'Add', href: '#', visuallyHiddenText: 'address' }
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
