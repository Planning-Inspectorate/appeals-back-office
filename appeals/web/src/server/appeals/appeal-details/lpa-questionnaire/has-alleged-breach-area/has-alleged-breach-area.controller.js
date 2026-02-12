import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { areIdParamsValid } from '#lib/validators/id-param.validator.js';
import { getLpaQuestionnaireFromId } from '../lpa-questionnaire.service.js';
import { changeAreaOfAllegedBreachInSquareMetresPage } from './has-alleged-breach-area.mapper.js';
import { changeAreaOfAllegedBreachInSquareMetres } from './has-alleged-breach-area.service.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeAreaOfAllegedBreachInSquareMetres = async (request, response) => {
	return renderChangeAreaOfAllegedBreachInSquareMetres(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderChangeAreaOfAllegedBreachInSquareMetres = async (request, response) => {
	try {
		const { errors, currentAppeal, apiClient } = request;

		const lpaQuestionnaireData = await getLpaQuestionnaireFromId(
			apiClient,
			currentAppeal.appealId,
			currentAppeal.lpaQuestionnaireId
		);

		const mappedPageContents = changeAreaOfAllegedBreachInSquareMetresPage(
			currentAppeal,
			lpaQuestionnaireData,
			request.session.areaOfAllegedBreachInSquareMetres
		);

		delete request.session.areaOfAllegedBreachInSquareMetres;

		return response.status(200).render('patterns/change-page.pattern.njk', {
			pageContent: mappedPageContents,
			errors
		});
	} catch (error) {
		logger.error(error);
		delete request.session.areaOfAllegedBreachInSquareMetres;
		return response.status(500).render('app/500.njk');
	}
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postChangeAreaOfAllegedBreachInSquareMetres = async (request, response) => {
	request.session.areaOfAllegedBreachInSquareMetres = {
		radio: request.body['areaOfAllegedBreachInSquareMetresRadio'],
		details: request.body['areaOfAllegedBreachInSquareMetres']
	};

	if (request.errors) {
		return renderChangeAreaOfAllegedBreachInSquareMetres(request, response);
	}

	const {
		params: { appealId, lpaQuestionnaireId },
		apiClient
	} = request;

	if (!areIdParamsValid(appealId, lpaQuestionnaireId)) {
		return response.status(400).render('app/400.njk');
	}

	try {
		await changeAreaOfAllegedBreachInSquareMetres(
			apiClient,
			appealId,
			lpaQuestionnaireId,
			request.session.areaOfAllegedBreachInSquareMetres
		);

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'changePage',
			appealId,
			text: 'Is the area of the alleged breach the same as the site area has been updated'
		});

		delete request.session.areaOfAllegedBreachInSquareMetres;

		return response.redirect(
			`/appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}`
		);
	} catch (error) {
		logger.error(error);
	}
	return response.status(500).render('app/500.njk');
};
