import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { HTTPError } from 'got';
import { getAppellantCaseFromAppealId } from '../appellant-case.service.js';
import { changeSiteAreaPage } from './site-area.mapper.js';
import { changeSiteArea } from './site-area.service.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeSiteArea = async (request, response) => {
	return renderChangeSiteArea(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderChangeSiteArea = async (request, response) => {
	try {
		const { errors, currentAppeal } = request;

		const appellantCaseData = await getAppellantCaseFromAppealId(
			request.apiClient,
			currentAppeal.appealId,
			currentAppeal.appellantCaseId
		);

		const mappedPageContents = changeSiteAreaPage(
			currentAppeal,
			appellantCaseData,
			request.session.siteArea
		);

		delete request.session.siteArea;

		return response.status(200).render('patterns/change-page.pattern.njk', {
			pageContent: mappedPageContents,
			errors
		});
	} catch (error) {
		logger.error(error);
		delete request.session.siteArea;
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
export const postChangeSiteArea = async (request, response) => {
	request.session.siteArea = request.body['siteArea'];

	if (request.errors) {
		return renderChangeSiteArea(request, response);
	}

	const {
		params: { appealId },
		currentAppeal
	} = request;

	const appellantCaseId = currentAppeal.appellantCaseId;

	try {
		await changeSiteArea(request.apiClient, appealId, appellantCaseId, request.session.siteArea);

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'changePage',
			appealId,
			text: 'Site area updated'
		});

		delete request.session.siteArea;

		return response.redirect(
			`/appeals-service/appeal-details/${currentAppeal.appealId}/appellant-case`
		);
	} catch (error) {
		logger.error(error);

		// Check if it's a validation error (400)
		if (error instanceof HTTPError && error.response.statusCode === 400) {
			// @ts-ignore
			request.errors = error.response.body.errors;
			return renderChangeSiteArea(request, response);
		}
	}

	return response.status(500).render('app/500.njk');
};
