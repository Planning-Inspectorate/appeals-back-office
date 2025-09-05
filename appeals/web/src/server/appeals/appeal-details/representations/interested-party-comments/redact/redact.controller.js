import { render } from '#appeals/appeal-details/representations/common/render.js';
import { isAtEditEntrypoint } from '#lib/edit-utilities.js';
import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { checkRedactedText } from '#lib/validators/redacted-text.validator.js';
import { confirmRedactInterestedPartyCommentPage } from './confirm.mapper.js';
import { redactInterestedPartyCommentPage } from './redact.mapper.js';
import { redactAndAcceptComment } from './redact.service.js';

/** @typedef {import("../../../appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {import('#appeals/appeal-details/representations/types.js').Representation} Representation */

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const renderRedactInterestedPartyComment = (request, response) => {
	const { errors, currentRepresentation, currentAppeal, session } = request;

	if (!currentRepresentation || !currentAppeal) {
		logger.warn('No representation or appeal found in session');
		return response.status(404).render('app/404.njk');
	}

	const baseUrl = `/appeals-service/appeal-details/${currentAppeal.appealId}/interested-party-comments/${currentRepresentation.id}`;
	const backUrl = `${baseUrl}/${isAtEditEntrypoint(request) ? 'redact/confirm' : 'review'}`;

	const pageContent = redactInterestedPartyCommentPage(
		currentAppeal,
		currentRepresentation,
		backUrl,
		session
	);

	return response.status(200).render('patterns/display-page.pattern.njk', {
		errors,
		pageContent
	});
};

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
