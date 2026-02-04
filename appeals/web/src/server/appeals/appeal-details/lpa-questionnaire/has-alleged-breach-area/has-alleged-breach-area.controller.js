import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { areIdParamsValid } from '#lib/validators/id-param.validator.js';
import { getLpaQuestionnaireFromId } from '../lpa-questionnaire.service.js';
import { changeHasAllegedBreachAreaPage } from './has-alleged-breach-area.mapper.js';
import { changeHasAllegedBreachArea } from './has-alleged-breach-area.service.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeHasAllegedBreachArea = async (request, response) => {
	return renderChangeHasAllegedBreachArea(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderChangeHasAllegedBreachArea = async (request, response) => {
	try {
		const { errors, currentAppeal, apiClient } = request;

		const lpaQuestionnaireData = await getLpaQuestionnaireFromId(
			apiClient,
			currentAppeal.appealId,
			currentAppeal.lpaQuestionnaireId
		);

		const mappedPageContents = changeHasAllegedBreachAreaPage(
			currentAppeal,
			lpaQuestionnaireData,
			request.session.HasAllegedBreachArea
		);

		delete request.session.HasAllegedBreachArea;

		return response.status(200).render('patterns/change-page.pattern.njk', {
			pageContent: mappedPageContents,
			errors
		});
	} catch (error) {
		logger.error(error);
		delete request.session.HasAllegedBreachArea;
		return response.status(500).render('app/500.njk');
	}
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postChangeHasAllegedBreachArea = async (request, response) => {
	request.session.hasAllegedBreachArea = request.body['hasAllegedBreachAreaRadio'];

	if (request.errors) {
		return renderChangeHasAllegedBreachArea(request, response);
	}

	const {
		params: { appealId, lpaQuestionnaireId },
		apiClient
	} = request;

	if (!areIdParamsValid(appealId, lpaQuestionnaireId)) {
		return response.status(400).render('app/400.njk');
	}

	try {
		await changeHasAllegedBreachArea(
			apiClient,
			appealId,
			lpaQuestionnaireId,
			request.session.hasAllegedBreachArea
		);

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'changePage',
			appealId,
			text: 'Is the area of the alleged breach the same as the site area has been updated'
		});

		delete request.session.hasAllegedBreachArea;

		return response.redirect(
			`/appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}`
		);
	} catch (error) {
		logger.error(error);
	}
	return response.status(500).render('app/500.njk');
};
