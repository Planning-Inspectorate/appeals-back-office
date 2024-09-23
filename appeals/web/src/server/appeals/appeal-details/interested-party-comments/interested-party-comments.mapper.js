import { mapPagination } from '#lib/mappers/pagination.mapper.js';
import { appealShortReference } from '#lib/appeals-formatter.js';

/**
 * @typedef {import('@pins/appeals.api').Appeals.SingleAppellantCaseResponse} SingleAppellantCaseResponse */
/** @typedef {import('#appeals/appeal-details/interested-party-comments/interested-party-comments.types').Representation} IPComments */
/** @typedef {import('#appeals/appeal-details/interested-party-comments/interested-party-comments.types').RepresentationList} IPCommentsList */
/** @typedef {import("../appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {import('@pins/appeals').Pagination} Pagination */

/**
 *
 * @param {SingleAppellantCaseResponse} appellantCaseData
 * @param {Appeal} appealDetails
 * @param {string} currentRoute
 * @param {import("#lib/pagination-utilities.js").PaginationParameters} paginationParameters
 * @param {import("express-session").Session & Partial<import("express-session").SessionData>} session
 * @param {IPCommentsList} awaitingReview
 * @param {IPCommentsList} valid
 * @param {IPCommentsList} invalid
 * @returns {Promise<PageContent>}
 */
export async function interestedPartyCommentsPage(
	appellantCaseData,
	appealDetails,
	currentRoute,
	paginationParameters,
	session,
	awaitingReview,
	valid,
	invalid
) {
	const shortReference = appealShortReference(appealDetails.appealReference);
	const pageContent = {
		title: `Interested Party Comments`,
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}`,
		preHeading: `Appeal ${shortReference}`,
		heading: 'Interested Party Comments',
		headingClasses: 'govuk-heading-l',
		pageComponents: [],
		awaitingReviewTable: createTable(awaitingReview),
		validTable: createTable(valid),
		invalidTable: createTable(invalid),
		paginationAwaiting: createPagination(
			'awaiting-review',
			awaitingReview,
			appealDetails.appealId,
			paginationParameters
		),
		paginationValid: createPagination('valid', valid, appealDetails.appealId, paginationParameters),
		paginationInvalid: createPagination(
			'invalid',
			invalid,
			appealDetails.appealId,
			paginationParameters
		)
	};

	return pageContent;
}

/**
 * Creates a table object for the interested party comments.
 * @param {IPCommentsList} commentsData - The comments data including items and metadata.
 * @returns {Object} The table object or an empty object if there are no items.
 */
function createTable(commentsData) {
	return commentsData.itemCount > 0
		? {
				head: [{ text: 'Interested party' }, { text: 'Submitted' }, { text: 'Action' }],
				rows: generateTableRows(commentsData.items),
				firstCellIsHeader: true
		  }
		: {};
}

/**
 * Creates a pagination object for the comments list if necessary.
 * @param {string} tab - The current tab (awaiting-review, valid, or invalid).
 * @param {IPCommentsList} commentsData - The comments data including items and metadata.
 * @param {number} appealId - The ID of the appeal.
 * @param {import("#lib/pagination-utilities.js").PaginationParameters} paginationParameters - The pagination parameters.
 * @returns {Pagination|null} The pagination object or null if pagination is not needed.
 */
function createPagination(tab, commentsData, appealId, paginationParameters) {
	return commentsData.itemCount > paginationParameters.pageSize
		? generatePagination(
				paginationParameters.pageNumber,
				`/appeals-service/appeal-details/${appealId}/interested-party-comments`,
				tab,
				commentsData.pageCount,
				paginationParameters.pageSize
		  )
		: null;
}

/**
 * Generates table rows for the interested party comments.
 * @param {Array<IPComments>} items - List of comments to generate rows for.
 * @returns {Array<Array<{text?: string, html?: string}>>} The formatted table rows.
 */
function generateTableRows(items) {
	return items.map((comment) => [
		{ text: comment.author },
		{
			text: new Date(comment.created).toLocaleDateString('en-GB', {
				day: 'numeric',
				month: 'long',
				year: 'numeric'
			})
		},
		{ html: `<a href="/comments/${comment.id}/review">Review</a>` }
	]);
}

/**
 * Helper function to generate pagination for a list
 *
 * @param {number} pageNumber - The current page number
 * @param {string} baseUrl - The base URL for pagination links
 * @param {string} tab - The current tab (awaiting-review, valid, or invalid)
 * @param {number} pageCount - Total number of pages
 * @param {number} pageSize - Number of items per page
 * @returns {Pagination} - The generated pagination object
 */
function generatePagination(
	pageNumber,
	baseUrl,
	tab,
	pageCount,
	pageSize,
	classes = 'pins-pagination'
) {
	const urlWithHash = `${baseUrl}#${tab}`;
	return mapPagination(pageNumber, pageCount, pageSize, urlWithHash, { tab }, classes);
}
