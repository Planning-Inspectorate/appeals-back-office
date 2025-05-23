import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { COMMENT_STATUS } from '@pins/appeals/constants/common.js';
import {
	reviewInterestedPartyCommentPage,
	viewInterestedPartyCommentPage
} from './view-and-review.mapper.js';
import { patchInterestedPartyCommentStatus } from './view-and-review.service.js';
import { render } from '#appeals/appeal-details/representations/common/render.js';

/** @typedef {import("../../../appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {import('#appeals/appeal-details/representations/types.js').Representation} Representation */

export const renderViewInterestedPartyComment = render(
	viewInterestedPartyCommentPage,
	'patterns/display-page.pattern.njk'
);

export const renderReviewInterestedPartyComment = render(
	reviewInterestedPartyCommentPage,
	'patterns/display-page.pattern.njk'
);

/**
 * @type {import('@pins/express').RenderHandler<any, any, any>}
 */
export const postReviewInterestedPartyComment = async (request, response, next) => {
	const {
		errors,
		params: { appealId, commentId },
		body: { status },
		apiClient,
		session,
		body
	} = request;

	if (errors) {
		return renderReviewInterestedPartyComment(request, response, next);
	}

	session.siteVisitRequested = body.siteVisitRequested;

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

	await patchInterestedPartyCommentStatus(
		apiClient,
		appealId,
		commentId,
		status,
		body['site-visit-request'] === 'site-visit'
	);

	addNotificationBannerToSession({
		session,
		bannerDefinitionKey: 'interestedPartyCommentsValidSuccess',
		appealId
	});

	return response.redirect(`/appeals-service/appeal-details/${appealId}/interested-party-comments`);
};
