import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { HTTPError } from 'got';
import * as lpaQuestionnaireService from '../lpa-questionnaire.service.js';
import { changePdRightsRemovedPage } from './pd-rights-removed.mapper.js';
import { changePdRightsRemoved } from './pd-rights-removed.service.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangePdRightsRemoved = async (request, response) => {
	return renderChangePdRightsRemoved(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderChangePdRightsRemoved = async (request, response) => {
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

		const mappedPageContents = changePdRightsRemovedPage(
			currentAppeal,
			lpaQuestionnaire,
			request.session.pdRightsRemoved,
			`/appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}`
		);

		delete request.session.pdRightsRemoved;

		return response.status(200).render('patterns/change-page.pattern.njk', {
			pageContent: mappedPageContents,
			errors
		});
	} catch (error) {
		logger.error(error);
		delete request.session.pdRightsRemoved;
		return response.status(500).render('app/500.njk');
	}
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postChangePdRightsRemoved = async (request, response) => {
	request.session.pdRightsRemoved = {
		radio: request.body['pdRightsRemovedRadio'],
		details: request.body['pdRightsRemoved']
	};

	if (request.errors) {
		return renderChangePdRightsRemoved(request, response);
	}

	const {
		params: { appealId, lpaQuestionnaireId }
	} = request;
	const appealData = request.currentAppeal;

	try {
		await changePdRightsRemoved(
			request.apiClient,
			appealId,
			appealData.lpaQuestionnaireId,
			request.session.pdRightsRemoved
		);

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'changePage',
			appealId,
			text: `Permitted development rights removed updated`
		});

		delete request.session.pdRightsRemoved;

		return response.redirect(
			`/appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}`
		);
	} catch (error) {
		logger.error(error);

		// Check if it's a validation error (400)
		if (error instanceof HTTPError && error.response.statusCode === 400) {
			// @ts-ignore
			request.errors = error.response.body.errors;
			return renderChangePdRightsRemoved(request, response);
		}
	}
	return response.status(500).render('app/500.njk');
};
