import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { logger } from '@azure/storage-blob';
import { cancelHearingPage } from './cancel-hearing.mapper.js';
import { cancelHearing } from './hearing.service.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getCancelHearing = async (request, response) => {
	const mappedPageContent = cancelHearingPage(request.currentAppeal);

	return response.status(200).render('patterns/check-and-confirm-page.pattern.njk', {
		pageContent: mappedPageContent
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postCancelHearing = async (request, response) => {
	const {
		currentAppeal: { appealId, hearing }
	} = request;

	try {
		await cancelHearing(request, hearing.hearingId);

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'hearingCancelled',
			appealId
		});

		delete request.session.setUpHearing;

		return response.redirect(`/appeals-service/appeal-details/${appealId}`);
	} catch (error) {
		logger.error(error);
	}

	return response.status(500).render('app/500.njk');
};
