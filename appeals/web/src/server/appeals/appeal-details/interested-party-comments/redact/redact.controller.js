import { redactInterestedPartyCommentPage } from './redact.mapper.js';
import { confirmRedactInterestedPartyCommentPage } from './confirm.mapper.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import logger from '#lib/logger.js';
import { patchInterestedPartyCommentRedaction } from './redact.service.js';
import { patchInterestedPartyCommentStatus } from '../view-and-review/view-and-review.service.js';
import { COMMENT_STATUS } from '@pins/appeals/constants/common.js';
import { render } from '#appeals/appeal-details/representations/common/render.js';

/** @typedef {import("../../appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {import('#appeals/appeal-details/representations/types.js').Representation} Representation */

export const renderRedactInterestedPartyComment = render(
	redactInterestedPartyCommentPage,
	'patterns/display-page.pattern.njk'
);

export const renderConfirmRedactInterestedPartyComment = render(
	confirmRedactInterestedPartyCommentPage,
	'patterns/display-page.pattern.njk'
);

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postRedactInterestedPartyComment = async (request, response) => {
	const {
		params: { appealId, commentId },
		body: { redactedRepresentation },
		session
	} = request;

	session.redactedRepresentation = redactedRepresentation;

	return response.redirect(
		`/appeals-service/appeal-details/${appealId}/interested-party-comments/${commentId}/redact/confirm`
	);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postConfirmRedactInterestedPartyComment = async (request, response) => {
	try {
		const {
			params: { appealId, commentId },
			session,
			apiClient
		} = request;

		await Promise.all([
			patchInterestedPartyCommentRedaction(
				apiClient,
				appealId,
				commentId,
				session.redactedRepresentation
			),
			patchInterestedPartyCommentStatus(apiClient, appealId, commentId, COMMENT_STATUS.VALID)
		]);

		delete session.redactedRepresentation;

		addNotificationBannerToSession(session, 'interestedPartyCommentsRedactionSuccess', appealId);

		return response.redirect(
			`/appeals-service/appeal-details/${appealId}/interested-party-comments/${commentId}/view`
		);
	} catch (error) {
		logger.error(error);
		return response.status(500).render('app/500.njk');
	}
};
