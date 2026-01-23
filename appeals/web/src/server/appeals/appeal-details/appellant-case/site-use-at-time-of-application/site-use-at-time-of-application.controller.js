import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { HTTPError } from 'got';
import { getAppellantCaseFromAppealId } from '../appellant-case.service.js';
import { changeSiteUseAtTimeOfApplicationPage } from './site-use-at-time-of-application.mapper.js';
import { changeSiteUseAtTimeOfApplication } from './site-use-at-time-of-application.service.js';
/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderSiteUseAtTimeOfApplication = async (request, response) => {
	try {
		const { errors, currentAppeal } = request;

		const appellantCaseData = await getAppellantCaseFromAppealId(
			request.apiClient,
			currentAppeal.appealId,
			currentAppeal.appellantCaseId
		);

		const mappedPageContents = changeSiteUseAtTimeOfApplicationPage(
			currentAppeal,
			appellantCaseData,
			request.session.siteUseAtTimeOfApplication
		);

		delete request.session.siteUseAtTimeOfApplication;

		return response.status(200).render('patterns/change-page.pattern.njk', {
			pageContent: mappedPageContents,
			errors
		});
	} catch (error) {
		logger.error(error);
		delete request.session.siteUseAtTimeOfApplication;
		if (error instanceof HTTPError && error.response.statusCode === 404) {
			return response.status(404).render('app/404.njk');
		} else {
			return response.status(500).render('app/500.njk');
		}
	}
};
/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getSiteUseAtTimeOfApplication = async (request, response) => {
	return renderSiteUseAtTimeOfApplication(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postSiteUseAtTimeOfApplication = async (request, response) => {
	const {
		params: { appealId },
		currentAppeal,
		apiClient,
		errors
	} = request;

	request.session.siteUseAtTimeOfApplication = request.body['siteUseAtTimeOfApplication'];

	console.log(
		'Posted site use at time of application:',
		request.session.siteUseAtTimeOfApplication
	);

	if (errors) {
		return renderSiteUseAtTimeOfApplication(request, response);
	}

	try {
		await changeSiteUseAtTimeOfApplication(
			apiClient,
			appealId,
			currentAppeal.appellantCaseId,
			request.session.siteUseAtTimeOfApplication
		);

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'changePage',
			appealId,
			text: 'Appeal updated'
		});

		delete request.session.siteUseAtTimeOfApplication;
		return response.redirect(`/appeals-service/appeal-details/${appealId}/appellant-case`);
	} catch (error) {
		logger.error(error);

		// Check if it's a validation error (400)
		if (error instanceof HTTPError && error.response.statusCode === 400) {
			// @ts-ignore
			request.errors = error.response.body.errors;
			return renderSiteUseAtTimeOfApplication(request, response);
		}
		return response.status(500).render('app/500.njk');
	}
};
