import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { areIdParamsValid } from '#lib/validators/id-param.validator.js';
import { getLpaQuestionnaireFromId } from '../lpa-questionnaire.service.js';
import { changeFloorSpaceCreatedByBreachInSquareMetresPage } from './alleged-breach-creates-floor-space.mapper.js';
import { changeFloorSpaceCreatedByBreachInSquareMetres } from './alleged-breach-creates-floor-space.service.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeFloorSpaceCreatedByBreachInSquareMetres = async (request, response) => {
	return renderChangeFloorSpaceCreatedByBreachInSquareMetres(request, response);
};
/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderChangeFloorSpaceCreatedByBreachInSquareMetres = async (request, response) => {
	try {
		const { errors, currentAppeal, apiClient } = request;

		const lpaQuestionnaireData = await getLpaQuestionnaireFromId(
			apiClient,
			currentAppeal.appealId,
			currentAppeal.lpaQuestionnaireId
		);

		const mappedPageContents = changeFloorSpaceCreatedByBreachInSquareMetresPage(
			currentAppeal,
			lpaQuestionnaireData,
			request.session.floorSpaceCreatedByBreachInSquareMetres
		);

		delete request.session.floorSpaceCreatedByBreachInSquareMetres;

		return response.status(200).render('patterns/change-page.pattern.njk', {
			pageContent: mappedPageContents,
			errors
		});
	} catch (error) {
		logger.error(error);
		delete request.session.floorSpaceCreatedByBreachInSquareMetres;
		return response.status(500).render('app/500.njk');
	}
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postChangeFloorSpaceCreatedByBreachInSquareMetres = async (request, response) => {
	request.session.floorSpaceCreatedByBreachInSquareMetres = {
		radio: request.body['floorSpaceCreatedByBreachInSquareMetresRadio'],
		details: request.body['floorSpaceCreatedByBreachInSquareMetres']
	};

	if (request.errors) {
		return renderChangeFloorSpaceCreatedByBreachInSquareMetres(request, response);
	}

	const {
		params: { appealId, lpaQuestionnaireId },
		apiClient
	} = request;

	if (!areIdParamsValid(appealId, lpaQuestionnaireId)) {
		return response.status(400).render('app/400.njk');
	}

	try {
		await changeFloorSpaceCreatedByBreachInSquareMetres(
			apiClient,
			appealId,
			lpaQuestionnaireId,
			request.session.floorSpaceCreatedByBreachInSquareMetres
		);

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'changePage',
			appealId,
			text: 'Does the alleged breach create any floor space has been updated'
		});

		delete request.session.floorSpaceCreatedByBreachInSquareMetres;

		return response.redirect(
			`/appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}`
		);
	} catch (error) {
		logger.error(error);
	}
	return response.status(500).render('app/500.njk');
};
