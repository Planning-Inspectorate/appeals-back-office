import { changeSingleDwellingHouse } from '#appeals/appeal-details/lpa-questionnaire/single-dwelling-house/single-dwelling-house.service.js';
import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { areIdParamsValid } from '#lib/validators/id-param.validator.js';
import { getLpaQuestionnaireFromId } from '../lpa-questionnaire.service.js';
import { changeSingleDwellingHousePage } from './single-dwelling-house.mapper.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeSingleDwellingHouse = async (request, response) => {
	return renderChangeSingleDwellingHouse(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderChangeSingleDwellingHouse = async (request, response) => {
	try {
		const { errors, currentAppeal, apiClient } = request;

		const lpaQuestionnaireData = await getLpaQuestionnaireFromId(
			apiClient,
			currentAppeal.appealId,
			currentAppeal.lpaQuestionnaireId
		);

		const mappedPageContents = changeSingleDwellingHousePage(
			currentAppeal,
			lpaQuestionnaireData,
			request.session.relatesToBuildingSingleDwellingHouse
		);

		delete request.session.relatesToBuildingSingleDwellingHouse;

		return response.status(200).render('patterns/change-page.pattern.njk', {
			pageContent: mappedPageContents,
			errors
		});
	} catch (error) {
		logger.error(error);
		delete request.session.relatesToBuildingSingleDwellingHouse;
		return response.status(500).render('app/500.njk');
	}
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postChangeSingleDwellingHouse = async (request, response) => {
	request.session.relatesToBuildingSingleDwellingHouse = request.body['singleDwellingHouseRadio'];

	if (request.errors) {
		return renderChangeSingleDwellingHouse(request, response);
	}

	const {
		params: { appealId, lpaQuestionnaireId },
		apiClient
	} = request;

	if (!areIdParamsValid(appealId, lpaQuestionnaireId)) {
		return response.status(400).render('app/400.njk');
	}

	try {
		await changeSingleDwellingHouse(
			apiClient,
			appealId,
			lpaQuestionnaireId,
			request.session.relatesToBuildingSingleDwellingHouse
		);

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'changePage',
			appealId,
			text: 'Is the enforcement notice for a single private dwelling house has been updated'
		});

		delete request.session.relatesToBuildingSingleDwellingHouse;

		return response.redirect(
			`/appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}`
		);
	} catch (error) {
		logger.error(error);
	}
	return response.status(500).render('app/500.njk');
};
