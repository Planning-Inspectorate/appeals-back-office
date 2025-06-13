import logger from '#lib/logger.js';
import { redactFinalCommentPage, confirmRedactFinalCommentPage } from './redact.mapper.js';
import { redactAndAccept } from '#appeals/appeal-details/representations/representations.service.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { formatFinalCommentsTypeText } from '../view-and-review/view-and-review.mapper.js';
import { checkRedactedText } from '#lib/validators/redacted-text.validator.js';

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getRedactFinalComment = async (request, response) => {
	const {
		errors,
		currentRepresentation,
		currentAppeal,
		session,
		params: { finalCommentsType }
	} = request;

	const pageContent = redactFinalCommentPage(
		currentAppeal,
		currentRepresentation,
		finalCommentsType,
		session
	);

	return response.status(200).render('patterns/display-page.pattern.njk', {
		errors,
		pageContent
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postRedactFinalComment = async (request, response) => {
	const {
		params: { appealId, finalCommentsType },
		body: { redactedRepresentation },
		session
	} = request;

	session.redactedRepresentation = redactedRepresentation;

	return response.redirect(
		`/appeals-service/appeal-details/${appealId}/final-comments/${finalCommentsType}/redact/confirm`
	);
};

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getConfirmRedactFinalComment = async (request, response) => {
	const {
		errors,
		currentRepresentation,
		currentAppeal,
		session,
		params: { finalCommentsType }
	} = request;

	if (!session.redactedRepresentation) {
		logger.warn('No redactedRepresentation found in session');
		return response.status(500).render('app/500.njk');
	}

	const pageContent = confirmRedactFinalCommentPage(
		currentAppeal,
		currentRepresentation,
		finalCommentsType,
		session
	);

	return response.status(200).render('patterns/display-page.pattern.njk', {
		errors,
		pageContent
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postConfirmRedactFinalComment = async (request, response) => {
	try {
		const {
			params: { appealId, finalCommentsType },
			session,
			apiClient,
			currentRepresentation
		} = request;
		//TODO: add accept comments flow
		const isRedacted = checkRedactedText(
			session.redactedRepresentation || '',
			currentRepresentation?.originalRepresentation || ''
		);
		await redactAndAccept(
			apiClient,
			appealId,
			currentRepresentation.id,
			session.redactedRepresentation
		);

		delete session.redactedRepresentation;
		if (!isRedacted) {
			const acceptFinalCommentsBannerType =
				currentRepresentation.representationType === 'appellant_final_comment'
					? 'appellantFinalCommentsAcceptSuccess'
					: 'lpaFinalCommentsAcceptSuccess';

			addNotificationBannerToSession({
				session: session,
				bannerDefinitionKey: acceptFinalCommentsBannerType,
				appealId
			});
		} else {
			addNotificationBannerToSession({
				session,
				bannerDefinitionKey: 'finalCommentsRedactionSuccess',
				appealId,
				text: `${formatFinalCommentsTypeText(
					finalCommentsType,
					true
				)} final comments redacted and accepted`
			});
		}

		return response.redirect(`/appeals-service/appeal-details/${appealId}`);
	} catch (error) {
		logger.error(error);
		return response.status(500).render('app/500.njk');
	}
};
