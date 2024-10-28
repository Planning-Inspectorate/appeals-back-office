// I'd like to find a common place to keep this but idk where that would be
import { render } from '../view-and-review/view-and-review.controller.js';
import { redactInterestedPartyCommentPage } from './redact.mapper.js';
// import { patchInterestedPartyCommentStatus } from './view-and-review.service.js';
// import logger from '#lib/logger.js';
// import { addNotificationBannerToSession } from '#lib/session-utilities.js';

/** @typedef {import("../../appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {import("../interested-party-comments.types.js").Representation} Representation */

export const renderRedactInterestedPartyComment = render(
	redactInterestedPartyCommentPage,
	'patterns/display-page.pattern.njk'
);

// /**
//  * @param {import('@pins/express/types/express.js').Request} request
//  * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
//  */
// export const postReviewInterestedPartyComment = async (request, response) => {
// 	try {
// 		const {
// 			errors,
// 			currentAppeal,
// 			params: { appealId, commentId },
// 			body: { status },
// 			apiClient,
// 			session
// 		} = request;

// 		if (!currentAppeal) {
// 			logger.error('Current appeal not found.');
// 			return response.status(500).render('app/500.njk');
// 		}

// 		if (errors) {
// 			const pageContent = reviewInterestedPartyCommentPage(
// 				request.currentAppeal,
// 				request.currentComment
// 			);

// 			return response.status(200).render('patterns/change-page.pattern.njk', {
// 				errors,
// 				pageContent
// 			});
// 		}

// 		if (status === 'valid_requires_redaction') {
// 			return response.redirect(
// 				`/appeals-service/appeal-details/${appealId}/interested-party-comments/${commentId}/redact`
// 			);
// 		}

// 		await patchInterestedPartyCommentStatus(apiClient, appealId, commentId, status);

// 		addNotificationBannerToSession(session, 'interestedPartyCommentsValidSuccess', appealId);

// 		return response.redirect(
// 			`/appeals-service/appeal-details/${appealId}/interested-party-comments`
// 		);
// 	} catch (error) {
// 		logger.error(error);
// 		return response.status(500).render('app/500.njk');
// 	}
// };
