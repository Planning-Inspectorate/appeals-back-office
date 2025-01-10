import logger from '#lib/logger.js';
import { confirmAcceptFinalCommentPage } from './accept.mapper.js';
import { patchFinalComment } from './accept.service.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getAcceptFinalComment = async (request, response) => {
	const {
		errors,
		currentRepresentation,
		currentAppeal,
		params: { finalCommentsType }
	} = request;

	const pageContent = confirmAcceptFinalCommentPage(
		currentAppeal,
		currentRepresentation,
		finalCommentsType
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
export const postConfirmAcceptFinalComment = async (request, response) => {
	try {
		const {
			params: { appealId },
			session,
			apiClient,
			currentRepresentation
		} = request;

		const resultOne = await patchFinalComment(
			apiClient,
			appealId,
			currentRepresentation.id,
			'valid'
		);
		console.log('🚀 ~ postConfirmAcceptFinalComment ~ resultOne:', resultOne);

		addNotificationBannerToSession(session, 'finalCommentsAcceptSuccess', appealId);

		return response.redirect(`/appeals-service/appeal-details/${appealId}`);
	} catch (error) {
		logger.error(error);
		return response.status(500).render('app/500.njk');
	}
};
