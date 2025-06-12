import { redactInterestedPartyCommentPage } from './redact.mapper.js';
import { confirmRedactInterestedPartyCommentPage } from './confirm.mapper.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { redactAndAcceptComment } from './redact.service.js';
import { render } from '#appeals/appeal-details/representations/common/render.js';
import { checkRedactedText } from '#lib/validators/redacted-text.validator.js';

/** @typedef {import("../../../appeal-details.types.js").WebAppeal} Appeal */
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
	const {
		params: { appealId, commentId },
		session,
		apiClient,
		currentRepresentation
	} = request;

	const isRedacted = checkRedactedText(
		session.redactedRepresentation || '',
		currentRepresentation?.originalRepresentation || ''
	);
	await redactAndAcceptComment(
		apiClient,
		appealId,
		commentId,
		session.redactedRepresentation,
		session.siteVisitRequested === 'site-visit'
	);

	delete session.redactedRepresentation;
	delete session.siteVisitRequested;
	if (isRedacted) {
		addNotificationBannerToSession({
			session,
			bannerDefinitionKey: 'interestedPartyCommentsRedactionSuccess',
			appealId
		});
	} else {
		addNotificationBannerToSession({
			session,
			bannerDefinitionKey: 'interestedPartyCommentsValidSuccess',
			appealId
		});
	}

	return response.redirect(`/appeals-service/appeal-details/${appealId}/interested-party-comments`);
};
