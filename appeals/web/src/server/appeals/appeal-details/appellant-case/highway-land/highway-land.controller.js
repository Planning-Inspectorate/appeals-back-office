import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { HTTPError } from 'got';
import { getAppellantCaseFromAppealId } from '../appellant-case.service.js';
import { changeHighwayLandPage } from './highway-land.mapper.js';
import { changeHighwayLand } from './highway-land.service.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeHighwayLand = async (request, response) => {
	return renderChangeHighwayLand(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderChangeHighwayLand = async (request, response) => {
	try {
		const { errors, currentAppeal } = request;

		const appellantCaseData = await getAppellantCaseFromAppealId(
			request.apiClient,
			currentAppeal.appealId,
			currentAppeal.appellantCaseId
		);

		const mappedPageContents = changeHighwayLandPage(
			currentAppeal,
			appellantCaseData,
			request.session.highwayLand
		);

		delete request.session.highwayLand;

		return response.status(200).render('patterns/change-page.pattern.njk', {
			pageContent: mappedPageContents,
			errors
		});
	} catch (error) {
		logger.error(error);
		delete request.session.highwayLand;
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
export const postChangeHighwayLand = async (request, response) => {
	if (request.errors) {
		return renderChangeHighwayLand(request, response);
	}

	const {
		params: { appealId },
		currentAppeal
	} = request;

	request.session.highwayLand = request.body['highwayLandRadio'] == 'yes';

	const appellantCaseId = currentAppeal.appellantCaseId;

	try {
		await changeHighwayLand(
			request.apiClient,
			appealId,
			appellantCaseId,
			request.session.highwayLand
		);

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'changePage',
			appealId,
			text: 'Appeal updated'
		});

		delete request.session.highwayLand;

		return response.redirect(
			`/appeals-service/appeal-details/${currentAppeal.appealId}/appellant-case`
		);
	} catch (error) {
		logger.error(error);

		// Check if it's a validation error (400)
		if (error instanceof HTTPError && error.response.statusCode === 400) {
			// @ts-ignore
			request.errors = error.response.body.errors;
			return renderChangeHighwayLand(request, response);
		}
	}

	return response.status(500).render('app/500.njk');
};
