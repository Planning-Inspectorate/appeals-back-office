import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { getAppellantCaseFromAppealId } from '../appellant-case.service.js';
import { changeDevelopmentTypePage } from './application-development-type.mapper.js';
import { changeDevelopmentType } from './application-development-type.service.js';

/**
 * @param {import('@pins/express').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeDevelopmentType = async (request, response) => {
	try {
		const { errors, currentAppeal, apiClient } = request;

		const appellantCaseData = await getAppellantCaseFromAppealId(
			apiClient,
			currentAppeal.appealId,
			currentAppeal.appellantCaseId
		);

		const mappedPageContents = changeDevelopmentTypePage(
			currentAppeal,
			appellantCaseData,
			request.session.developmentType
		);

		return response
			.status(200)
			.render('patterns/change-page.pattern.njk', { pageContent: mappedPageContents, errors });
	} catch (error) {
		logger.error(error);
		return response.status(500).render('app/500.njk');
	}
};

/**
 * @param {import('@pins/express').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postChangeDevelopmentType = async (request, response) => {
	request.session.developmentType = {
		value: request.body['developmentType']
	};

	if (request.errors) {
		return getChangeDevelopmentType(request, response);
	}

	try {
		const { currentAppeal, apiClient } = request;
		const { value } = request.session.developmentType;

		await changeDevelopmentType(
			apiClient,
			currentAppeal.appealId,
			currentAppeal.appellantCaseId,
			value
		);

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'changePage',
			appealId: currentAppeal.appealId,
			text: 'Development type changed'
		});

		delete request.session.developmentType;

		return response.redirect(
			`/appeals-service/appeal-details/${currentAppeal.appealId}/appellant-case`
		);
	} catch (error) {
		logger.error(error);
		return response.status(500).render('app/500.njk');
	}
};
