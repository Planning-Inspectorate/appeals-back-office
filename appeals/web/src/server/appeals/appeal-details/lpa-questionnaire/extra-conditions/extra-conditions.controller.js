import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { changeExtraConditionsPage } from './extra-conditions.mapper.js';
import { changeExtraConditions } from './extra-conditions.service.js';
import * as lpaQuestionnaireService from '../lpa-questionnaire.service.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeExtraConditions = async (request, response) => {
	return renderChangeExtraConditions(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderChangeExtraConditions = async (request, response) => {
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

		const mappedPageContents = changeExtraConditionsPage(
			currentAppeal,
			lpaQuestionnaire,
			request.session.extraConditions,
			`/appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}`
		);

		delete request.session.extraConditions;

		return response.status(200).render('patterns/change-page.pattern.njk', {
			pageContent: mappedPageContents,
			errors
		});
	} catch (error) {
		logger.error(error);
		delete request.session.extraConditions;
		return response.status(500).render('app/500.njk');
	}
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postChangeExtraConditions = async (request, response) => {
	request.session.extraConditions = {
		radio: request.body['extraConditionsRadio'],
		details: request.body['extraConditionsDetails']
	};

	if (request.errors) {
		return renderChangeExtraConditions(request, response);
	}

	const {
		params: { appealId, lpaQuestionnaireId }
	} = request;
	const appealData = request.currentAppeal;

	try {
		await changeExtraConditions(
			request.apiClient,
			appealId,
			appealData.lpaQuestionnaireId,
			request.session.extraConditions
		);

		addNotificationBannerToSession(
			request.session,
			'changePage',
			appealId,
			`<p class="govuk-notification-banner__heading">Extra conditions updated</p>`
		);

		delete request.session.extraConditions;

		return response.redirect(
			`/appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}`
		);
	} catch (error) {
		logger.error(error);
	}
	return response.status(500).render('app/500.njk');
};