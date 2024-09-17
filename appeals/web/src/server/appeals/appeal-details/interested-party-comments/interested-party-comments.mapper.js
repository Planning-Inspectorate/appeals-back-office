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
	const awaitingReviewTable = {
		head: [{ text: 'Interested party' }, { text: 'Submitted' }, { text: 'Action' }],
		rows: generateTableRows(awaitingReview),
		firstCellIsHeader: true
	};

	const validTable = {
		head: [{ text: 'Interested party' }, { text: 'Submitted' }, { text: 'Action' }],
		rows: generateTableRows(valid),
		firstCellIsHeader: true
	};

	const invalidTable = {
		head: [{ text: 'Interested party' }, { text: 'Submitted' }, { text: 'Action' }],
		rows: generateTableRows(invalid),
		firstCellIsHeader: true
	};

	const paginationAwaiting = generatePagination(
		paginationParameters.pageNumber,
		`/appeals-service/appeal-details/${appealDetails.appealId}/interested-party-comments?tab=awaiting-review`,
		5,
		10
	);

	const paginationValid = generatePagination(
		paginationParameters.pageNumber,
		`/appeals-service/appeal-details/${appealDetails.appealId}/interested-party-comments?tab=valid`,
		5,
		10
	);

	const paginationInvalid = generatePagination(
		paginationParameters.pageNumber,
		`/appeals-service/appeal-details/${appealDetails.appealId}/interested-party-comments?tab=invalid`,
		5,
		10
	);

	const pageContent = {
		title: `Interested Party Comments`,
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}`,
		preHeading: `Appeal ${appealDetails.appealReference}`,
		heading: 'Interested Party Comments',
		pageComponents: [],
		awaitingReviewTable,
		validTable,
		invalidTable,
		paginationAwaiting,
		paginationValid,
		paginationInvalid
	};

	return pageContent;
}

/**
 *
 * @param {IPCommentsList} commentsList - List of comments to generate rows for.
 * @returns {Array} - The formatted table rows.
 */
function generateTableRows(commentsList) {
	return commentsList.items.map((comment) => [
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
 * @param {number} [itemsPerPage=10] - Number of items per page (default is 10)
 * @returns {Pagination} - The generated pagination object
 */
const generatePagination = (pageNumber, baseUrl, pageCount = 1, itemsPerPage = 10) => {
	return mapPagination(pageNumber, pageCount, itemsPerPage, baseUrl, {});
};
