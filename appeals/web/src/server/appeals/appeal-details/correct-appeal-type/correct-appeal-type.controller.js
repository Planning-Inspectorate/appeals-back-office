import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { getLpaQuestionnaireFromId } from '../lpa-questionnaire/lpa-questionnaire.service.js';
import { changeCorrectAppealTypePage } from './correct-appeal-type.mapper.js';
import { changeCorrectAppealType } from './correct-appeal-type.service.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeCorrectAppealType = async (request, response) => {
	return renderChangeCorrectAppealType(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderChangeCorrectAppealType = async (request, response) => {
	try {
		const { errors, currentAppeal, apiClient } = request;

		const lpaQuestionnaireData = await getLpaQuestionnaireFromId(
			apiClient,
			currentAppeal.appealId,
			currentAppeal.lpaQuestionnaireId
		);

		const mappedPageContents = changeCorrectAppealTypePage(
			currentAppeal,
			lpaQuestionnaireData,
			request.session.isCorrectType
		);

		delete request.session.isCorrectType;

		return response.render('patterns/change-page.pattern.njk', {
			pageContent: mappedPageContents,
			errors
		});
	} catch (error) {
		logger.error(error);
		delete request.session.isCorrectType;
		return response.render('app/500.njk');
	}
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postChangeCorrectAppealType = async (request, response) => {
	request.session.isCorrectType = request.body['correctAppealTypeRadio'];

	if (request.errors) {
		return renderChangeCorrectAppealType(request, response);
	}

	const {
		params: { appealId, lpaQuestionnaireId },
		apiClient
	} = request;

	try {
		await changeCorrectAppealType(
			apiClient,
			appealId,
			lpaQuestionnaireId,
			request.session.isCorrectType
		);

		addNotificationBannerToSession(request.session, 'isAppealTypeCorrectUpdated', appealId);

		delete request.session.isCorrectType;

		return response.redirect(
			`/appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}`
		);
	} catch (error) {
		logger.error(error);
	}
	return response.render('app/500.njk');
};
