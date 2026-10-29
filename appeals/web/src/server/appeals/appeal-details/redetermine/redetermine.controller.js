import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';
import { mapRedetermineConfirmationPage } from './redetermine.mapper.js';
import { postRedetermineAppeal } from './redetermine.service.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getRedetermineConfirmationPage = async (request, response) => {
	const { currentAppeal } = request;

	if (!currentAppeal) {
		return response.status(404).render('app/404.njk');
	}

	if (currentAppeal.appealStatus !== APPEAL_CASE_STATUS.COMPLETE) {
		return response.redirect(`/appeals-service/appeal-details/${currentAppeal.appealId}`);
	}

	const pageContent = mapRedetermineConfirmationPage(currentAppeal);

	return response.render('patterns/check-and-confirm-page.pattern.njk', {
		pageContent
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postRedetermine = async (request, response) => {
	const { currentAppeal } = request;

	if (!currentAppeal) {
		return response.status(404).render('app/404.njk');
	}

	if (currentAppeal.appealStatus !== APPEAL_CASE_STATUS.COMPLETE) {
		return response.redirect(`/appeals-service/appeal-details/${currentAppeal.appealId}`);
	}

	await postRedetermineAppeal(request.apiClient, currentAppeal.appealId);

	addNotificationBannerToSession({
		session: request.session,
		bannerDefinitionKey: 'appealRedetermined',
		appealId: currentAppeal.appealId
	});

	return response.redirect(`/appeals-service/appeal-details/${currentAppeal.appealId}`);
};
