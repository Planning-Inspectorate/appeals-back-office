import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { HTTPError } from 'got';
import { getAppellantCaseFromAppealId } from '../appellant-case.service.js';
import { changeDevelopmentDescriptionPage } from './development-description.mapper.js';
import { changeDevelopmentDescription } from './development-description.service.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeDevelopmentDescription = async (request, response) => {
	return renderChangeDevelopmentDescription(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderChangeDevelopmentDescription = async (request, response) => {
	const { currentAppeal, apiClient, errors } = request;

	const appellantCaseData = await getAppellantCaseFromAppealId(
		apiClient,
		currentAppeal.appealId,
		currentAppeal.appellantCaseId
	);

	const mappedPageContents = changeDevelopmentDescriptionPage(
		currentAppeal,
		appellantCaseData,
		request.session.developmentDescription
	);

	delete request.session.developmentDescription;

	return response.status(200).render('patterns/change-page.pattern.njk', {
		pageContent: mappedPageContents,
		errors
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postChangeDevelopmentDescription = async (request, response) => {
	request.session.developmentDescription = request.body['developmentDescription'];
	const { currentAppeal, apiClient, errors } = request;
	const { appealId, appellantCaseId } = currentAppeal;
	if (errors) {
		return renderChangeDevelopmentDescription(request, response);
	}

	try {
		await changeDevelopmentDescription(
			apiClient,
			appealId,
			appellantCaseId,
			request.session.developmentDescription
		);

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'changePage',
			appealId,
			text: 'Original development description has been updated'
		});
		delete request.session.developmentDescription;
		return response.redirect(`/appeals-service/appeal-details/${appealId}/appellant-case`);
	} catch (error) {
		logger.error(error);

		// Check if it's a validation error (400)
		if (error instanceof HTTPError && error.response.statusCode === 400) {
			// @ts-ignore
			request.errors = error.response.body.errors;
			return renderChangeDevelopmentDescription(request, response);
		}
	}
	return response.status(500).render('app/500.njk');
};
