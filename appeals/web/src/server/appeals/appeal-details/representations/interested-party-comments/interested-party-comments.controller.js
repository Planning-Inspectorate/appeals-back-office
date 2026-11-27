import { APPEAL_CASE_PRE_STATEMENTS_STATUS } from '#appeals/appeal.constants.js';
import { isStatePassed } from '#lib/appeal-status.js';
import { mapPagination } from '#lib/mappers/index.js';
import { getSavedBackUrl } from '#lib/middleware/save-back-url.js';
import { addBackLinkQueryToUrl, addQueryParamsToUrl } from '#lib/url-utilities.js';
import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';
import {
	interestedPartyCommentsPage,
	sharedIpCommentsPage
} from './interested-party-comments.mapper.js';
import * as interestedPartyCommentsService from './interested-party-comments.service.js';

/**
 * Pagination parameters for fetching interested party comments - note no pagination UI is implemented yet,
 * so we fetch a large number of comments to display all at once in 1 page
 * @type {{pageNumber: number, pageSize: number}}
 */
const paginationParameters = {
	pageNumber: 1,
	pageSize: 1000
};

export const SHARED_IP_COMMENTS_PAGE_SIZE = 10;

/**
 * @param {any} pageNumberQuery
 * @returns {number} the requested page number, or 1
 */
const parsePageNumber = (pageNumberQuery) => {
	const pageNumber = Number(pageNumberQuery);
	return Number.isInteger(pageNumber) && pageNumber > 0 ? pageNumber : 1;
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const handleInterestedPartyComments = (request, response) => {
	const statementsCompleted =
		!APPEAL_CASE_PRE_STATEMENTS_STATUS.includes(request.currentAppeal?.appealStatus) ||
		isStatePassed(request.currentAppeal, APPEAL_CASE_STATUS.STATEMENTS);

	return (
		statementsCompleted ||
			(request.currentAppeal?.documentationSummary?.ipComments?.counts?.published ?? 0) > 0
			? renderSharedInterestedPartyComments
			: renderInterestedPartyComments
	)(request, response);
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export async function renderInterestedPartyComments(request, response) {
	const { errors, currentAppeal, session } = request;

	if (currentAppeal?.appellantCaseId == null) {
		return response.status(404).render('app/404.njk');
	}

	const [awaitingReviewComments, invalidComments, validComments] = await Promise.all([
		interestedPartyCommentsService.getInterestedPartyComments(
			request.apiClient,
			currentAppeal.appealId,
			'awaiting_review',
			paginationParameters.pageNumber,
			paginationParameters.pageSize
		),
		interestedPartyCommentsService.getInterestedPartyComments(
			request.apiClient,
			currentAppeal.appealId,
			'invalid',
			paginationParameters.pageNumber,
			paginationParameters.pageSize
		),
		interestedPartyCommentsService.getInterestedPartyComments(
			request.apiClient,
			currentAppeal.appealId,
			'valid',
			paginationParameters.pageNumber,
			paginationParameters.pageSize
		)
	]);

	const mappedPageContent = await interestedPartyCommentsPage(
		currentAppeal,
		awaitingReviewComments,
		validComments,
		invalidComments,
		session,
		getSavedBackUrl(request, 'manageIpComments'),
		request
	);

	return response.status(200).render('appeals/appeal/interested-party-comments.njk', {
		pageContent: mappedPageContent,
		errors
	});
}

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export async function renderSharedInterestedPartyComments(request, response) {
	const { errors, currentAppeal } = request;
	const pageNumber = parsePageNumber(request.query.pageNumber);

	const comments = await interestedPartyCommentsService.getInterestedPartyComments(
		request.apiClient,
		currentAppeal.appealId,
		'published',
		pageNumber,
		SHARED_IP_COMMENTS_PAGE_SIZE
	);
	const pageCount = comments.pageCount ?? 1;

	if (pageCount > 0 && pageNumber > pageCount) {
		return response.redirect(
			addQueryParamsToUrl(request.originalUrl, { pageNumber: String(pageCount) })
		);
	}

	const addInterestedPartCommentsLink = addBackLinkQueryToUrl(
		request,
		`/appeals-service/appeal-details/${currentAppeal.appealId}/interested-party-comments/add`
	);
	const pageContent = sharedIpCommentsPage(
		currentAppeal,
		comments.items,
		addInterestedPartCommentsLink,
		request.session,
		getSavedBackUrl(request, 'manageIpComments'),
		(pageNumber - 1) * SHARED_IP_COMMENTS_PAGE_SIZE + 1 // first comment number
	);

	const pagination = mapPagination(
		pageNumber,
		pageCount,
		SHARED_IP_COMMENTS_PAGE_SIZE,
		request.originalUrl.split('?')[0],
		request.query,
		false
	);

	return response.status(200).render('patterns/display-page.pattern.njk', {
		errors,
		pageContent,
		pagination
	});
}
