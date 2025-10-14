import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { HTTPError } from 'got';
import { getAppellantCaseFromAppealId } from '../appellant-case.service.js';
import { changeApplicationOutcomePage } from './application-outcome.mapper.js';
import { changeApplicationOutcome } from './application-outcome.service.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeApplicationOutcome = async (request, response) => {
	return renderChangeApplicationOutcome(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderChangeApplicationOutcome = async (request, response) => {
	try {
		const { errors, currentAppeal, apiClient } = request;
		const appellantCaseData = await getAppellantCaseFromAppealId(
			apiClient,
			currentAppeal.appealId,
			currentAppeal.appellantCaseId
		);

		const mappedPageContents = changeApplicationOutcomePage(
			currentAppeal,
			appellantCaseData,
			request.session.applicationOutcome
		);

		delete request.session.applicationOutcome;

		return response.status(200).render('patterns/change-page.pattern.njk', {
			pageContent: mappedPageContents,
			errors
		});
	} catch (error) {
		logger.error(error);
		delete request.session.applicationOutcome;
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
export const postChangeApplicationOutcome = async (request, response) => {
	if (request.errors) {
		return renderChangeApplicationOutcome(request, response);
	}

	try {
		const applicationOutcome = request.body['applicationOutcome'];
		const { currentAppeal, apiClient } = request;
		const { appealId, appellantCaseId } = currentAppeal;

		await changeApplicationOutcome(apiClient, appealId, appellantCaseId, applicationOutcome);

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'changePage',
			appealId,
			text: 'Application decision outcome changed'
		});

		delete request.session.applicationOutcome;

		return response.redirect(`/appeals-service/appeal-details/${appealId}/appellant-case`);
	} catch (error) {
		logger.error(error);
	}
	delete request.session.applicationOutcome;
	return response.status(500).render('app/500.njk');
};
