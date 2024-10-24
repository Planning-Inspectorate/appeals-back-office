import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import {
	reviewInterestedPartyCommentPage,
	viewInterestedPartyCommentPage
} from './view-and-review.mapper.js';
import { patchInterestedPartyCommentStatus } from './view-and-review.service.js';

/** @typedef {import("../../appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {import("../interested-party-comments.types.js").Representation} Representation */

/**
 *
 * @param {(appealDetails: Appeal, comment: Representation) => PageContent} contentMapper
 * @param {string} templatePath
 * @returns {import('@pins/express').RenderHandler<unknown>}
 */
const render = (contentMapper, templatePath) => (request, response) => {
	const { errors, currentComment, currentAppeal } = request;

	if (!currentComment) {
		return response.status(404).render('app/404.njk');
	}

	const pageContent = contentMapper(currentAppeal, currentComment);

	return response.status(200).render(templatePath, {
		errors,
		pageContent
	});
};

export const renderViewInterestedPartyComment = render(
	viewInterestedPartyCommentPage,
	'patterns/display-page.pattern.njk'
);

export const renderReviewInterestedPartyComment = render(
	reviewInterestedPartyCommentPage,
	'patterns/change-page.pattern.njk'
);

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postReviewInterestedPartyComment = async (request, response) => {
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
		logger.error(error);
		return response.status(500).render('app/500.njk');
	}
};
