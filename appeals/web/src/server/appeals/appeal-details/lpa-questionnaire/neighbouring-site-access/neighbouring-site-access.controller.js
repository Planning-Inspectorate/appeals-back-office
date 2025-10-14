import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { getLpaQuestionnaireFromId } from '../lpa-questionnaire.service.js';
import { changeNeighbouringSiteAccessPage } from './neighbouring-site-access.mapper.js';
import { changeNeighbouringSiteAccess } from './neighbouring-site-access.service.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeNeighbouringSiteAccess = async (request, response) => {
	return renderChangeNeighbouringSiteAccess(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderChangeNeighbouringSiteAccess = async (request, response) => {
	const {
		errors,
		apiClient,
		params: { appealId, lpaQuestionnaireId }
	} = request;

	const lpaQuestionnaire = await getLpaQuestionnaireFromId(apiClient, appealId, lpaQuestionnaireId);

	const mappedPageContents = changeNeighbouringSiteAccessPage(
		request.currentAppeal,
		lpaQuestionnaire.reasonForNeighbourVisits,
		request.session.neighbouringSiteAccess?.radio,
		request.session.neighbouringSiteAccess?.details
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
export const postChangeNeighbouringSiteAccess = async (request, response) => {
	request.session.neighbouringSiteAccess = {
		radio: request.body['neighbouringSiteAccessRadio'],
		details: request.body['neighbouringSiteAccess']
	};

	if (request.errors) {
		return renderChangeNeighbouringSiteAccess(request, response);
	}

	const {
		params: { appealId, lpaQuestionnaireId },
		apiClient
	} = request;

	try {
		await changeNeighbouringSiteAccess(
			apiClient,
			appealId,
			lpaQuestionnaireId,
			request.session.neighbouringSiteAccess
		);

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'changePage',
			appealId,
			text: 'Might the inspector need to enter a neighbour’s land or property updated'
		});

		delete request.session.neighbouringSiteAccess;

		return response.redirect(
			`/appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}`
		);
	} catch (error) {
		logger.error(error);
	}
	return response.status(500).render('app/500.njk');
};
