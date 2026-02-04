import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { HTTPError } from 'got';
import * as lpaQuestionnaireService from '../lpa-questionnaire.service.js';
import { changeTrunkRoadPage } from './trunk-road.mapper.js';
import { changeTrunkRoad } from './trunk-road.service.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeTrunkRoad = async (request, response) => {
	return renderChangeTrunkRoad(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderChangeTrunkRoad = async (request, response) => {
	try {
		const {
			errors,
			currentAppeal,
			params: { appealId, lpaQuestionnaireId }
		} = request;

		const lpaQuestionnaire = await lpaQuestionnaireService.getLpaQuestionnaireFromId(
			request.apiClient,
			currentAppeal.appealId,
			lpaQuestionnaireId
		);

		if (!lpaQuestionnaire) {
			return response.status(404).render('app/404.njk');
		}

		const mappedPageContents = changeTrunkRoadPage(
			currentAppeal,
			lpaQuestionnaire,
			request.session.trunkRoad,
			`/appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}`
		);

		delete request.session.trunkRoad;

		return response.status(200).render('patterns/change-page.pattern.njk', {
			pageContent: mappedPageContents,
			errors
		});
	} catch (error) {
		logger.error(error);
		delete request.session.trunkRoad;
		return response.status(500).render('app/500.njk');
	}
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postChangeTrunkRoad = async (request, response) => {
	request.session.trunkRoad = {
		radio: request.body['trunkRoadRadio'],
		details: request.body['trunkRoadDetails']
	};

	if (request.errors) {
		return renderChangeTrunkRoad(request, response);
	}

	const {
		params: { appealId, lpaQuestionnaireId }
	} = request;
	const appealData = request.currentAppeal;

	try {
		await changeTrunkRoad(
			request.apiClient,
			appealId,
			appealData.lpaQuestionnaireId,
			request.session.trunkRoad
		);

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'changePage',
			appealId,
			text: `Trunk road updated`
		});

		delete request.session.trunkRoad;

		return response.redirect(
			`/appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}`
		);
	} catch (error) {
		logger.error(error);

		// Check if it's a validation error (400)
		if (error instanceof HTTPError && error.response.statusCode === 400) {
			// @ts-ignore
			request.errors = error.response.body.errors;
			return renderChangeTrunkRoad(request, response);
		}
	}
	return response.status(500).render('app/500.njk');
};
