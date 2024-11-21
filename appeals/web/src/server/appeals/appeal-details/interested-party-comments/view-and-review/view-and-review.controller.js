import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { COMMENT_STATUS } from '@pins/appeals/constants/common.js';
import {
	reviewInterestedPartyCommentPage,
	viewInterestedPartyCommentPage
} from './view-and-review.mapper.js';
import { patchInterestedPartyCommentStatus } from './view-and-review.service.js';

/** @typedef {import("../../appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {import("../interested-party-comments.types.js").Representation} Representation */

/**
 *
 * @param {(appealDetails: Appeal, comment: Representation, session: import('express-session').Session & Record<string, string>) => PageContent} contentMapper
 * @param {string} templatePath
 * @returns {import('@pins/express').RenderHandler<any, any, any>}
 */
export const render = (contentMapper, templatePath) => (request, response) => {
	const { errors, currentComment, currentAppeal, session } = request;

	if (!currentComment) {
		return response.status(404).render('app/404.njk');
	}

	const pageContent = contentMapper(currentAppeal, currentComment, session);

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
 * @type {import('@pins/express').RenderHandler<any, any, any>}
 */
export const postReviewInterestedPartyComment = async (request, response, next) => {
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
			renderViewInterestedPartyComment(request, response, next);
		}

		if (status === COMMENT_STATUS.VALID_REQUIRES_REDACTION) {
			return response.redirect(
				`/appeals-service/appeal-details/${appealId}/interested-party-comments/${commentId}/redact`
			);
		}

		if (status === COMMENT_STATUS.INVALID) {
			return response.redirect(
				`/appeals-service/appeal-details/${appealId}/interested-party-comments/${commentId}/reject/select-reason`
			);
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
