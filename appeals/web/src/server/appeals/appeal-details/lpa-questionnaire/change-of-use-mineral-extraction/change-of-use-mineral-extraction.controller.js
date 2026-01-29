import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { areIdParamsValid } from '#lib/validators/id-param.validator.js';
import { getLpaQuestionnaireFromId } from '../lpa-questionnaire.service.js';
import { changeOfUseMineralExtractionPage } from './change-of-use-mineral-extraction.mapper.js';
import { changeOfUseMineralExtraction } from './change-of-use-mineral-extraction.service.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeOfUseMineralExtraction = async (request, response) => {
	return renderChangeOfUseMineralExtraction(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderChangeOfUseMineralExtraction = async (request, response) => {
	try {
		const { errors, currentAppeal, apiClient } = request;

		const lpaQuestionnaireData = await getLpaQuestionnaireFromId(
			apiClient,
			currentAppeal.appealId,
			currentAppeal.lpaQuestionnaireId
		);

		const mappedPageContents = changeOfUseMineralExtractionPage(
			currentAppeal,
			lpaQuestionnaireData,
			request.session.changeOfUseMineralExtraction
		);

		delete request.session.changeOfUseMineralExtraction;

		return response.status(200).render('patterns/change-page.pattern.njk', {
			pageContent: mappedPageContents,
			errors
		});
	} catch (error) {
		logger.error(error);
		delete request.session.changeOfUseMineralExtraction;
		return response.status(500).render('app/500.njk');
	}
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postChangeOfUseMineralExtraction = async (request, response) => {
	request.session.changeOfUseMineralExtraction = request.body['changeOfUseMineralExtractionRadio'];

	if (request.errors) {
		return renderChangeOfUseMineralExtraction(request, response);
	}

	const {
		params: { appealId, lpaQuestionnaireId },
		apiClient
	} = request;

	if (!areIdParamsValid(appealId, lpaQuestionnaireId)) {
		return response.status(400).render('app/400.njk');
	}

	try {
		await changeOfUseMineralExtraction(
			apiClient,
			appealId,
			lpaQuestionnaireId,
			request.session.changeOfUseMineralExtraction
		);

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'changePage',
			appealId,
			text: 'Does the enforcement notice include the change of use of land to dispose of remaining materials after mineral extraction has been updated'
		});

		delete request.session.changeOfUseMineralExtraction;

		return response.redirect(
			`/appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}`
		);
	} catch (error) {
		logger.error(error);
	}
	return response.status(500).render('app/500.njk');
};
