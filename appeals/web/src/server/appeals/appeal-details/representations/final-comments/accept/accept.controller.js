import { setRepresentationStatus } from '#appeals/appeal-details/representations/representations.service.js';
import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { confirmAcceptFinalCommentPage } from './accept.mapper.js';

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

		await setRepresentationStatus(
			apiClient,
			parseInt(appealId, 10),
			currentRepresentation.id,
			'valid'
		);

		const acceptFinalCommentsBannerType =
			currentRepresentation.representationType === 'appellant_final_comment'
				? 'appellantFinalCommentsAcceptSuccess'
				: 'lpaFinalCommentsAcceptSuccess';

		addNotificationBannerToSession({
			session: session,
			bannerDefinitionKey: acceptFinalCommentsBannerType,
			appealId
		});

		return response.redirect(`/appeals-service/appeal-details/${appealId}`);
	} catch (error) {
		logger.error(error);
		return response.status(500).render('app/500.njk');
	}
};
