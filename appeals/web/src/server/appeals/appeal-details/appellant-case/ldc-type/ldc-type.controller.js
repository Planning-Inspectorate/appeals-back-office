import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { HTTPError } from 'got';
import { getAppellantCaseFromAppealId } from '../appellant-case.service.js';
import { changeApplicationMadeUnderActSectionPage } from './ldc-type.mapper.js';
import { changeApplicationMadeUnderActSection } from './ldc-type.service.js';
/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const renderApplicationMadeUnderActSection = async (request, response) => {
	try {
		const { errors, currentAppeal } = request;

		const appellantCaseData = await getAppellantCaseFromAppealId(
			request.apiClient,
			currentAppeal.appealId,
			currentAppeal.appellantCaseId
		);

		const mappedPageContents = changeApplicationMadeUnderActSectionPage(
			currentAppeal,
			appellantCaseData,
			request.session.applicationMadeUnderActSection
		);

		delete request.session.applicationMadeUnderActSection;

		return response.status(200).render('patterns/change-page.pattern.njk', {
			pageContent: mappedPageContents,
			errors
		});
	} catch (error) {
		logger.error(error);
		delete request.session.applicationMadeUnderActSection;
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

export const getApplicationMadeUnderActSection = async (request, response) => {
	return renderApplicationMadeUnderActSection(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */

export const postApplicationMadeUnderActSection = async (request, response) => {
	const {
		params: { appealId },
		currentAppeal,
		apiClient,
		errors
	} = request;

	request.session.applicationMadeUnderActSection = request.body['applicationMadeUnderActSection'];

	if (errors) {
		return renderApplicationMadeUnderActSection(request, response);
	}

	try {
		await changeApplicationMadeUnderActSection(
			apiClient,
			appealId,
			currentAppeal.appellantCaseId,
			request.session.applicationMadeUnderActSection
		);

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'changePage',
			appealId,
			text: 'Appeal updated'
		});

		delete request.session.applicationMadeUnderActSection;
		return response.redirect(`/appeals-service/appeal-details/${appealId}/appellant-case`);
	} catch (error) {
		logger.error(error);

		if (error instanceof HTTPError && error.response.statusCode === 404) {
			// @ts-ignore
			request.errors = error.response.body.errors;
			return response.status(404).render('app/404.njk');
		} else {
			return response.status(500).render('app/500.njk');
		}
	}
};
