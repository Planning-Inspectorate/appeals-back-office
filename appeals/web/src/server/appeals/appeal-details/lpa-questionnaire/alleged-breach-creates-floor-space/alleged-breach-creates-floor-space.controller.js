import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { areIdParamsValid } from '#lib/validators/id-param.validator.js';
import { getLpaQuestionnaireFromId } from '../lpa-questionnaire.service.js';
import { changeAllegedBreachCreatesFloorSpacePage } from './alleged-breach-creates-floor-space.mapper.js';
import { changeAllegedBreachCreatesFloorSpace } from './alleged-breach-creates-floor-space.service.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeAllegedBreachCreatesFloorSpace = async (request, response) => {
	return renderChangeAllegedBreachCreatesFloorSpace(request, response);
};
/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderChangeAllegedBreachCreatesFloorSpace = async (request, response) => {
	try {
		const { errors, currentAppeal, apiClient } = request;

		const lpaQuestionnaireData = await getLpaQuestionnaireFromId(
			apiClient,
			currentAppeal.appealId,
			currentAppeal.lpaQuestionnaireId
		);

		const mappedPageContents = changeAllegedBreachCreatesFloorSpacePage(
			currentAppeal,
			lpaQuestionnaireData,
			request.session.allegedBreachCreatesFloorSpace
		);

		delete request.session.allegedBreachCreatesFloorSpace;

		return response.status(200).render('patterns/change-page.pattern.njk', {
			pageContent: mappedPageContents,
			errors
		});
	} catch (error) {
		logger.error(error);
		delete request.session.AllegedBreachCreatesFloorSpace;
		return response.status(500).render('app/500.njk');
	}
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postChangeAllegedBreachCreatesFloorSpace = async (request, response) => {
	request.session.allegedBreachCreatesFloorSpace =
		request.body['allegedBreachCreatesFloorSpaceRadio'];

	if (request.errors) {
		return renderChangeAllegedBreachCreatesFloorSpace(request, response);
	}

	const {
		params: { appealId, lpaQuestionnaireId },
		apiClient
	} = request;

	if (!areIdParamsValid(appealId, lpaQuestionnaireId)) {
		return response.status(400).render('app/400.njk');
	}

	try {
		await changeAllegedBreachCreatesFloorSpace(
			apiClient,
			appealId,
			lpaQuestionnaireId,
			request.session.allegedBreachCreatesFloorSpace
		);

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'changePage',
			appealId,
			text: 'Does the alleged breach create any floor space has been updated'
		});

		delete request.session.allegedBreachCreatesFloorSpace;

		return response.redirect(
			`/appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}`
		);
	} catch (error) {
		logger.error(error);
	}
	return response.status(500).render('app/500.njk');
};
