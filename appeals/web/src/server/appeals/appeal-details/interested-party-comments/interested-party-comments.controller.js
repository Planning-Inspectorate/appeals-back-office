import logger from '#lib/logger.js';
import {
	interestedPartyCommentsPage,
	viewInterestedPartyCommentPage
} from './interested-party-comments.mapper.js';
import * as interestedPartyCommentsService from './interested-party-comments.service.js';

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const renderInterestedPartyComments = async (request, response) => {
	const { errors, currentAppeal } = request;
	const paginationParameters = {
		pageNumber: 1,
		pageSize: 1000
	};

	if (currentAppeal?.appellantCaseId == null) {
		return response.status(404).render('app/404.njk');
	}

	try {
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
			invalidComments
		);

		return response.status(200).render('appeals/appeal/interested-party-comments.njk', {
			pageContent: mappedPageContent,
			errors
		});
	} catch (error) {
		logger.error(error);
		return response.status(500).render('app/500.njk');
	}
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export async function renderViewInterestedPartyComment(request, response) {
	const { errors, currentComment } = request;

	if (!currentComment) {
		return response.status(404).render('app/404.njk');
	}

	const pageContent = viewInterestedPartyCommentPage(request.currentAppeal, request.currentComment);

	return response.status(200).render('patterns/display-page.pattern.njk', {
		errors,
		pageContent
	});
}