import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { getLpaQuestionnaireFromId } from '../lpa-questionnaire.service.js';
import { relatesToAgriculturalPurposePage } from './relates-to-agricultural-purpose.mapper.js';
import { relatesToAgriculturalPurpose } from './relates-to-agricultural-purpose.service.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getRelatesToAgriculturalPurpose = async (request, response) => {
	return renderRelatesToAgriculturalPurpose(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderRelatesToAgriculturalPurpose = async (request, response) => {
	try {
		const { errors, currentAppeal, apiClient } = request;

		const lpaQuestionnaireData = await getLpaQuestionnaireFromId(
			apiClient,
			currentAppeal.appealId,
			currentAppeal.lpaQuestionnaireId
		);

		const mappedPageContents = relatesToAgriculturalPurposePage(
			currentAppeal,
			lpaQuestionnaireData,
			request.session.relatesToAgriculturalPurpose
		);

		delete request.session.relatesToAgriculturalPurpose;

		return response.status(200).render('patterns/change-page.pattern.njk', {
			pageContent: mappedPageContents,
			errors
		});
	} catch (error) {
		logger.error(error);
		delete request.session.relatesToAgriculturalPurpose;
		return response.status(500).render('app/500.njk');
	}
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postRelatesToAgriculturalPurpose = async (request, response) => {
	request.session.relatesToAgriculturalPurpose = request.body['relatesToAgriculturalPurposeRadio'];

	if (request.errors) {
		return renderRelatesToAgriculturalPurpose(request, response);
	}

	const {
		params: { appealId, lpaQuestionnaireId },
		apiClient
	} = request;

	try {
		await relatesToAgriculturalPurpose(
			apiClient,
			appealId,
			lpaQuestionnaireId,
			request.session.relatesToAgriculturalPurpose
		);

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'changePage',
			appealId,
			text: 'Enforcement notice relates to agricultural purpose (LPA response) has been updated'
		});

		delete request.session.relatesToAgriculturalPurpose;

		return response.redirect(
			`/appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}`
		);
	} catch (error) {
		logger.error(error);
	}
	return response.status(500).render('app/500.njk');
};
