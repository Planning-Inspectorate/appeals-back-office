import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { HTTPError } from 'got';
import { getLpaQuestionnaireFromId } from '../lpa-questionnaire.service.js';
import { changeAppealUnderActSectionPage } from './ldc-type.mapper.js';
import { changeAppealUnderActSection } from './ldc-type.service.js';
/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const renderAppealUnderActSection = async (request, response) => {
	try {
		const { errors, currentAppeal } = request;

		const lpaCaseData = await getLpaQuestionnaireFromId(
			request.apiClient,
			currentAppeal.appealId,
			currentAppeal.lpaQuestionnaireId
		);

		const mappedPageContents = changeAppealUnderActSectionPage(
			currentAppeal,
			lpaCaseData,
			request.session.appealUnderActSection
		);

		delete request.session.appealUnderActSection;

		return response.status(200).render('patterns/change-page.pattern.njk', {
			pageContent: mappedPageContents,
			errors
		});
	} catch (error) {
		logger.error(error);
		delete request.session.appealUnderActSection;
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

export const getAppealUnderActSection = async (request, response) => {
	return renderAppealUnderActSection(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */

export const postAppealUnderActSection = async (request, response) => {
	const {
		params: { appealId },
		currentAppeal,
		apiClient,
		errors
	} = request;

	request.session.appealUnderActSection = request.body['appealUnderActSection'];

	if (errors) {
		return renderAppealUnderActSection(request, response);
	}

	try {
		await changeAppealUnderActSection(
			apiClient,
			appealId,
			currentAppeal.lpaQuestionnaireId,
			request.session.appealUnderActSection
		);

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'changePage',
			appealId,
			text: 'Appeal updated'
		});

		delete request.session.appealUnderActSection;
		return response.redirect(
			`/appeals-service/appeal-details/${appealId}/lpa-questionnaire/${currentAppeal.lpaQuestionnaireId}`
		);
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
