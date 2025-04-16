import {
	interestedPartyCommentsPage,
	sharedIpCommentsPage
} from './interested-party-comments.mapper.js';
import * as interestedPartyCommentsService from './interested-party-comments.service.js';
import { getBackLinkUrlFromQuery } from '#lib/url-utilities.js';

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const handleInterestedPartyComments = (request, response) =>
	((request.currentAppeal?.documentationSummary?.ipComments?.counts?.published ?? 0) === 0
		? renderInterestedPartyComments
		: renderSharedInterestedPartyComments)(request, response);

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export async function renderInterestedPartyComments(request, response) {
	const { errors, currentAppeal, session } = request;
	const paginationParameters = {
		pageNumber: 1,
		pageSize: 1000
	};

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
		getBackLinkUrlFromQuery(request)
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

	const comments = await interestedPartyCommentsService.getInterestedPartyComments(
		request.apiClient,
		currentAppeal.appealId,
		'published'
	);

	const pageContent = sharedIpCommentsPage(currentAppeal, comments.items);

	return response.status(200).render('patterns/display-page.pattern.njk', {
		errors,
		pageContent
	});
}
