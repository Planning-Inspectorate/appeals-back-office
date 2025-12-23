import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { HTTPError } from 'got';
import { getAppellantCaseFromAppealId } from '../appellant-case.service.js';
import { changeApplicationDevelopmentAllOrPartPage } from './application-development-all-or-part.mapper.js';
import { changeApplicationDevelopmentAllOrPart } from './application-development-all-or-part.service.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeApplicationDevelopmentAllOrPart = async (request, response) => {
	return renderChangeApplicationDevelopmentAllOrPart(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderChangeApplicationDevelopmentAllOrPart = async (request, response) => {
	try {
		const { errors, currentAppeal } = request;

		const appellantCaseData = await getAppellantCaseFromAppealId(
			request.apiClient,
			currentAppeal.appealId,
			currentAppeal.appellantCaseId
		);

		const mappedPageContents = changeApplicationDevelopmentAllOrPartPage(
			currentAppeal,
			appellantCaseData
		);

		return response.status(errors ? 400 : 200).render('patterns/change-page.pattern.njk', {
			pageContent: mappedPageContents,
			errors
		});
	} catch (error) {
		logger.error(error);
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
export const postChangeApplicationDevelopmentAllOrPart = async (request, response) => {
	if (request.errors) {
		return renderChangeApplicationDevelopmentAllOrPart(request, response);
	}

	const {
		params: { appealId },
		currentAppeal
	} = request;

	const appellantCaseId = currentAppeal.appellantCaseId;

	try {
		await changeApplicationDevelopmentAllOrPart(
			request.apiClient,
			appealId,
			appellantCaseId,
			request.body['applicationDevelopmentAllOrPartRadio']
		);

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'changePage',
			appealId,
			text: 'Appeal updated'
		});

		delete request.session.applicationDevelopmentAllOrPart;

		return response.redirect(
			`/appeals-service/appeal-details/${currentAppeal.appealId}/appellant-case`
		);
	} catch (error) {
		logger.error(error);
	}

	return response.status(500).render('app/500.njk');
};
