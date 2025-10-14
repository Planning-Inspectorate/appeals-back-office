import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { HTTPError } from 'got';
import { getAppellantCaseFromAppealId } from '../appellant-case.service.js';
import { changeAdvertisementDescriptionPage } from './advertisement-description.mapper.js';
import { changeAdvertisementDescription } from './advertisement-description.service.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeAdvertisementDescription = async (request, response) => {
	return renderChangeAdvertisementDescription(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderChangeAdvertisementDescription = async (request, response) => {
	const { currentAppeal, apiClient, errors } = request;

	const appellantCaseData = await getAppellantCaseFromAppealId(
		apiClient,
		currentAppeal.appealId,
		currentAppeal.appellantCaseId
	);

	const mappedPageContents = changeAdvertisementDescriptionPage(
		currentAppeal,
		appellantCaseData,
		request.session.advertisementDescription
	);

	delete request.session.advertisementDescription;

	return response.status(200).render('patterns/change-page.pattern.njk', {
		pageContent: mappedPageContents,
		errors
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postChangeAdvertisementDescription = async (request, response) => {
	request.session.advertisementDescription = request.body['advertisementDescription'];
	const { currentAppeal, apiClient, errors } = request;
	const { appealId, appellantCaseId } = currentAppeal;
	if (errors) {
		return renderChangeAdvertisementDescription(request, response);
	}

	try {
		await changeAdvertisementDescription(
			apiClient,
			appealId,
			appellantCaseId,
			request.session.advertisementDescription
		);

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'changePage',
			appealId,
			text: 'Appeal updated'
		});
		delete request.session.advertisementDescription;
		return response.redirect(`/appeals-service/appeal-details/${appealId}/appellant-case`);
	} catch (error) {
		logger.error(error);

		// Check if it's a validation error (400)
		if (error instanceof HTTPError && error.response.statusCode === 400) {
			// @ts-ignore
			request.errors = error.response.body.errors;
			return renderChangeAdvertisementDescription(request, response);
		}
	}
	return response.status(500).render('app/500.njk');
};
