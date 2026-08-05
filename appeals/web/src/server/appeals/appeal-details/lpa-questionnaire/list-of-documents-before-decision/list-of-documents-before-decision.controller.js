import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { HTTPError } from 'got';
import { getLpaQuestionnaireFromId } from '../lpa-questionnaire.service.js';
import { changeListDocumentsBeforeDecisionPage } from './list-of-documents-before-decision.mapper.js';
import { changeListDocumentsBeforeDecision } from './list-of-documents-before-decision.service.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeListDocumentsBeforeDecision = async (request, response) => {
	try {
		const { errors, currentAppeal } = request;
		const lpaQuestionnaireData = await getLpaQuestionnaireFromId(
			request.apiClient,
			currentAppeal.appealId,
			currentAppeal.lpaQuestionnaireId
		);

		const mappedPageContents = changeListDocumentsBeforeDecisionPage(
			currentAppeal,
			lpaQuestionnaireData,
			request.session.listDocumentsBeforeDecision
		);

		return response.status(200).render('patterns/change-page.pattern.njk', {
			pageContent: mappedPageContents,
			errors
		});
	} catch (error) {
		logger.error(error);

		if (error instanceof HTTPError && error.response.statusCode === 404) {
			return response.status(404).render('app/404.njk');
		} else {
			return response.status(500).render('app/500.njk');
		}
	}
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postChangeListDocumentsBeforeDecision = async (request, response) => {
	if (request.errors) {
		return getChangeListDocumentsBeforeDecision(request, response);
	}

	const {
		params: { appealId },
		currentAppeal
	} = request;

	request.session.listDocumentsBeforeDecision = {
		textarea: request.body['listDocumentsBeforeDecisionTextarea']
	};

	try {
		await changeListDocumentsBeforeDecision(
			request.apiClient,
			appealId,
			currentAppeal.lpaQuestionnaireId,
			request.session.listDocumentsBeforeDecision.textarea
		);

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'changePage',
			appealId,
			text: 'List of documents before decision updated'
		});

		delete request.session.listDocumentsBeforeDecision;

		return response.redirect(
			`/appeals-service/appeal-details/${currentAppeal.appealId}/lpa-questionnaire/${currentAppeal.lpaQuestionnaireId}`
		);
	} catch (error) {
		logger.error(error);
	}

	return response.status(500).render('app/500.njk');
};
