import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { getLpaQuestionnaireFromId } from '../lpa-questionnaire.service.js';
import { relatesToErectionBuildingsPage } from './relates-to-erection-buildings.mapper.js';
import { erectionBuildings as relatesToErectionBuildings } from './relates-to-erection-buildings.service.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getRelatesToErectionBuildings = async (request, response) => {
	return renderRelatesToErectionBuildings(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderRelatesToErectionBuildings = async (request, response) => {
	try {
		const { errors, currentAppeal, apiClient } = request;

		const lpaQuestionnaireData = await getLpaQuestionnaireFromId(
			apiClient,
			currentAppeal.appealId,
			currentAppeal.lpaQuestionnaireId
		);

		const mappedPageContents = relatesToErectionBuildingsPage(
			currentAppeal,
			lpaQuestionnaireData,
			request.session.relatesToErectionBuildings
		);

		delete request.session.relatesToErectionBuildings;

		return response.status(200).render('patterns/change-page.pattern.njk', {
			pageContent: mappedPageContents,
			errors
		});
	} catch (error) {
		logger.error(error);
		delete request.session.relatesToErectionBuildings;
		return response.status(500).render('app/500.njk');
	}
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postRelatesToErectionBuildings = async (request, response) => {
	request.session.relatesToErectionBuildings = request.body['relatesToErectionBuildingsRadio'];

	if (request.errors) {
		return renderRelatesToErectionBuildings(request, response);
	}

	const {
		params: { appealId, lpaQuestionnaireId },
		apiClient
	} = request;

	try {
		await relatesToErectionBuildings(
			apiClient,
			appealId,
			lpaQuestionnaireId,
			request.session.relatesToErectionBuildings
		);

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'changePage',
			appealId,
			text: 'Enforcement notice relates to erection of a building or buildings (LPA response) has been updated'
		});

		delete request.session.relatesToErectionBuildings;

		return response.redirect(
			`/appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}`
		);
	} catch (error) {
		logger.error(error);
	}
	return response.status(500).render('app/500.njk');
};
