import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { getLpaQuestionnaireFromId } from '../lpa-questionnaire.service.js';
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
			request.session.isCorrectType,
			errors ? errors['correctAppealTypeRadio']?.msg : undefined
		);

		delete request.session.isCorrectType;

		return response.status(200).render('patterns/change-page.pattern.njk', {
			pageContent: mappedPageContents,
			errors
		});
	} catch (error) {
		logger.error(error);
		delete request.session.isCorrectType;
		return response.status(500).render('app/500.njk');
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

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'changePage',
			appealId,
			text: 'LPA questionnaire updated'
		});

		delete request.session.isCorrectType;

		return response.redirect(
			`/appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}`
		);
	} catch (error) {
		logger.error(error);
	}
	return response.status(500).render('app/500.njk');
};
