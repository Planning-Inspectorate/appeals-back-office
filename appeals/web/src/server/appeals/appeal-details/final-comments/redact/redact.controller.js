import logger from '#lib/logger.js';
import { redactFinalCommentPage, confirmRedactFinalCommentPage } from './redact.mapper.js';
import { patchFinalCommentRedaction } from './redact.service.js';
import { setRepresentationStatus } from '../../representations/representations.service.js';
import { COMMENT_STATUS } from '@pins/appeals/constants/common.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';

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
export const getAcceptFinalComment = async (request, response) => {
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
			params: { appealId, commentId },
			session,
			apiClient
		} = request;

		await Promise.all([
			patchFinalCommentRedaction(apiClient, appealId, commentId, session.redactedRepresentation),
			setRepresentationStatus(apiClient, parseInt(appealId, 10), parseInt(commentId, 10), COMMENT_STATUS.VALID)
		]);

		delete session.redactedRepresentation;

		addNotificationBannerToSession(session, 'finalCommentsRedactionSuccess', appealId);

		return response.redirect(`/appeals-service/appeal-details/${appealId}`);
	} catch (error) {
		logger.error(error);
		return response.status(500).render('app/500.njk');
	}
};
