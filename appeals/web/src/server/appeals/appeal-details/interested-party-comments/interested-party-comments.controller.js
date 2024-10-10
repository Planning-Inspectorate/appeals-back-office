import logger from '#lib/logger.js';
import {
	interestedPartyCommentsPage,
	reviewInterestedPartyCommentPage,
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

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export async function renderReviewInterestedPartyComment(request, response) {
	const { errors, currentComment } = request;

	console.log('renderReviewInterestedPartyComment');
	console.log(request.currentComment);

	if (!currentComment) {
		return response.status(404).render('app/404.njk');
	}

	const pageContent = reviewInterestedPartyCommentPage(request.currentAppeal, currentComment);

	return response.status(200).render('patterns/change-page.pattern.njk', {
		errors,
		pageContent
	});
}

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const renderPostReviewInterestedPartyComment = async (request, response) => {
	try {
		const { appealId, commentId } = request.params;
		const { errors, currentAppeal } = request;

		if (!currentAppeal) {
			logger.error('Current appeal not found.');
			return response.status(500).render('app/500.njk');
		}

		if (errors) {
			const pageContent = reviewInterestedPartyCommentPage(
				request.currentAppeal,
				request.currentComment
			);

			return response.status(200).render('patterns/change-page.pattern.njk', {
				errors,
				pageContent
			});
		}

		return response.redirect(
			`/appeals-service/appeal-details/${appealId}/interested-party-comments/${commentId}/reject-comment`
		);
	} catch (error) {
		logger.error('Error in postReviewComment: ', error);
		return response.status(500).render('app/500.njk');
	}
};
