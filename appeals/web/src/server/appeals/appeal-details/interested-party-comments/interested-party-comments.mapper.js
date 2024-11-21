import { appealShortReference } from '#lib/appeals-formatter.js';
import { dateISOStringToDisplayDate } from '#lib/dates.js';
import { buildNotificationBanners } from '#lib/mappers/index.js';
import { addressInputs } from '#lib/mappers/index.js';

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
	const shortReference = appealShortReference(appealDetails.appealReference);

	const notificationBanners = buildNotificationBanners(
		session,
		'ipComments',
		appealDetails.appealId
	);

	const pageContent = {
		title: 'Interested party comments',
		backLinkUrl: '/appeals-service/personal-list',
		addCommentUrl: `/appeals-service/appeal-details/${appealDetails.appealId}/interested-party-comments/add`,
		preHeading: `Appeal ${shortReference}`,
		heading: 'Interested party comments',
		headingClasses: 'govuk-heading-l',
		pageComponents: [...notificationBanners],
		awaitingReviewTable: createTable(awaitingReview, true),
		validTable: createTable(valid, false),
		invalidTable: createTable(invalid, false)
	};

	return pageContent;
}

/**
 * @param {Appeal} appealDetails
 * @param {{ addressLine1: string, addressLine2: string, town: string, county: string, postCode: string }} address
 * @param {import('@pins/express').ValidationErrors | undefined} errors
 * @param {string} backPath
 * @param {string} operationType
 * @returns {PageContent}
 * */
export const ipAddressPage = (appealDetails, address, errors, backPath, operationType) => ({
	title: "Interested party's address",
	backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}/interested-party-comments/${backPath}`,
	preHeading: `Appeal ${appealShortReference(appealDetails.appealReference)}`,
	heading: "Interested party's address",
	pageComponents: addressInputs({ address, operationType, errors })
});

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
		{ text: comment.author, classes: 'govuk-!-width-one-half' },
		{ text: dateISOStringToDisplayDate(comment.created), classes: 'govuk-!-width-one-half' },
		{
			html: `<a href="./interested-party-comments/${comment.id}/${
				isReview ? 'review' : 'view'
			}" class="govuk-link">${
				isReview ? 'Review' : 'View'
			}<span class="govuk-visually-hidden"> interested party comments from ${
				comment.author
			}</span></a>`,
			classes: 'govuk-!-width-one-half'
		}
	]);
}
