import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { areIdParamsValid } from '#lib/validators/id-param.validator.js';
import { getLpaQuestionnaireFromId } from '../lpa-questionnaire.service.js';
import { changeOfUseMineralStoragePage } from './change-of-use-mineral-storage.mapper.js';
import { changeOfUseMineralStorage } from './change-of-use-mineral-storage.service.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeOfUseMineralStorage = async (request, response) => {
	return renderChangeOfUseMineralStorage(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderChangeOfUseMineralStorage = async (request, response) => {
	try {
		const { errors, currentAppeal, apiClient } = request;

		const lpaQuestionnaireData = await getLpaQuestionnaireFromId(
			apiClient,
			currentAppeal.appealId,
			currentAppeal.lpaQuestionnaireId
		);

		const mappedPageContents = changeOfUseMineralStoragePage(
			currentAppeal,
			lpaQuestionnaireData,
			request.session.changeOfUseMineralStorage
		);

		delete request.session.changeOfUseMineralStorage;

		return response.status(200).render('patterns/change-page.pattern.njk', {
			pageContent: mappedPageContents,
			errors
		});
	} catch (error) {
		logger.error(error);
		delete request.session.changeOfUseMineralStorage;
		return response.status(500).render('app/500.njk');
	}
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postChangeOfUseMineralStorage = async (request, response) => {
	request.session.changeOfUseMineralStorage = request.body['changeOfUseMineralStorageRadio'];

	if (request.errors) {
		return renderChangeOfUseMineralStorage(request, response);
	}

	const {
		params: { appealId, lpaQuestionnaireId },
		apiClient
	} = request;

	if (!areIdParamsValid(appealId, lpaQuestionnaireId)) {
		return response.status(400).render('app/400.njk');
	}

	try {
		await changeOfUseMineralStorage(
			apiClient,
			appealId,
			lpaQuestionnaireId,
			request.session.changeOfUseMineralStorage
		);

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'changePage',
			appealId,
			text: 'Does the enforcement notice include a change of use of land to store minerals in the open has been updated'
		});

		delete request.session.changeOfUseMineralStorage;

		return response.redirect(
			`/appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}`
		);
	} catch (error) {
		logger.error(error);
	}
	return response.status(500).render('app/500.njk');
};
