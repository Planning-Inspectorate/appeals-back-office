import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { getLpaQuestionnaireFromId } from '../../lpa-questionnaire.service.js';
import { changeEiaDevelopmentDescriptionPage } from './eia-development-description.mapper.js';
import { changeEiaDevelopmentDescription } from './eia-development-description.service.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderChangeEiaDevelopmentDescription = async (request, response) => {
	const {
		errors,
		apiClient,
		params: { appealId, lpaQuestionnaireId }
	} = request;

	const lpaQuestionnaire = await getLpaQuestionnaireFromId(apiClient, appealId, lpaQuestionnaireId);

	const mappedPageContents = changeEiaDevelopmentDescriptionPage(
		request.currentAppeal,
		lpaQuestionnaire.eiaDevelopmentDescription
	);

	return response.status(200).render('patterns/change-page.pattern.njk', {
		pageContent: mappedPageContents,
		errors
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeEiaDevelopmentDescription = renderChangeEiaDevelopmentDescription;

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postChangeEiaDevelopmentDescription = async (request, response) => {
	request.session.eiaDevelopmentDescription = request.body['eiaDevelopmentDescription'];

	if (request.errors) {
		return renderChangeEiaDevelopmentDescription(request, response);
	}

	const {
		params: { appealId, lpaQuestionnaireId },
		apiClient
	} = request;

	try {
		await changeEiaDevelopmentDescription(
			apiClient,
			appealId,
			lpaQuestionnaireId,
			request.session.eiaDevelopmentDescription
		);

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'changePage',
			appealId,
			text: 'Description of development updated'
		});

		delete request.session.eiaDevelopmentDescription;

		return response.redirect(
			`/appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}`
		);
	} catch (error) {
		logger.error(error);
	}
	return response.status(500).render('app/500.njk');
};
