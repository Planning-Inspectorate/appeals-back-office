import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import {
	reviewInterestedPartyCommentPage,
	viewInterestedPartyCommentPage
} from './view-and-review.mapper.js';
import { patchInterestedPartyCommentStatus } from './view-and-review.service.js';

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
		const {
			errors,
			currentAppeal,
			params: { appealId, commentId },
			body: { status },
			apiClient,
			session
		} = request;

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

		await patchInterestedPartyCommentStatus(apiClient, appealId, commentId, status);

		addNotificationBannerToSession(session, 'interestedPartyCommentsValidSuccess', appealId);

		return response.redirect(
			`/appeals-service/appeal-details/${appealId}/interested-party-comments`
		);
	} catch (error) {
		console.log('🚀 ~ renderPostReviewInterestedPartyComment ~ error:', error);
		logger.error(error);
		return response.status(500).render('app/500.njk');
	}
};
