// @ts-nocheck
import { mapPagination } from '#lib/mappers/pagination.mapper.js';

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
	const createTable = (items) =>
		items.length > 0
			? {
					head: [{ text: 'Interested party' }, { text: 'Submitted' }, { text: 'Action' }],
					rows: generateTableRows(items),
					firstCellIsHeader: true
			  }
			: {};

	const createPagination = (tab, items) =>
		items.length >= 26
			? generatePagination(
					paginationParameters.pageNumber,
					`/appeals-service/appeal-details/${appealDetails.appealId}/interested-party-comments?tab=${tab}`,
					Math.ceil(items.length / 25)
			  )
			: null;

	const pageContent = {
		title: `Interested Party Comments`,
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}`,
		preHeading: `Appeal ${appealDetails.appealReference}`,
		heading: 'Interested Party Comments',
		pageComponents: [],
		awaitingReviewTable: createTable(awaitingReview.items),
		validTable: createTable(valid.items),
		invalidTable: createTable(invalid.items),
		paginationAwaiting: createPagination('awaiting-review', awaitingReview.items),
		paginationValid: createPagination('valid', valid.items),
		paginationInvalid: createPagination('invalid', invalid.items)
	};

	return pageContent;
}

/**
 *
 * @param {IPCommentsList} commentsList - List of comments to generate rows for.
 * @returns {Array} - The formatted table rows.
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
 * @param {number} [pageCount=1] - Total number of pages (default is 1)
 * @param {number} [itemsPerPage=25] - Number of items per page (default is 25)
 * @returns {Pagination} - The generated pagination object
 */
const generatePagination = (pageNumber, baseUrl, pageCount = 1, itemsPerPage = 25) => {
	return mapPagination(pageNumber, pageCount, itemsPerPage, baseUrl, {});
};
