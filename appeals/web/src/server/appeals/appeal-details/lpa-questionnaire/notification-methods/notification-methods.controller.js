import { ensureArray } from '#lib/array-utilities.js';
import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import * as lpaQuestionnaireService from '../lpa-questionnaire.service.js';
import { changeNotificationMethodsPage } from './notification-methods.mapper.js';
import {
	changeNotificationMethods,
	getLpaNotificationMethods
} from './notification-methods.service.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeNotificationMethods = async (request, response) => {
	return renderChangeNotificationMethods(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderChangeNotificationMethods = async (request, response) => {
	try {
		const {
			errors,
			currentAppeal,
			params: { appealId, lpaQuestionnaireId }
		} = request;

		const [lpaQuestionnaire, lpaNotificationMethods] = await Promise.all([
			lpaQuestionnaireService.getLpaQuestionnaireFromId(
				request.apiClient,
				currentAppeal.appealId,
				lpaQuestionnaireId
			),
			getLpaNotificationMethods(request.apiClient)
		]);

		if (!lpaQuestionnaire) {
			return response.status(404).render('app/404.njk');
		}
		if (!lpaNotificationMethods) {
			return response.status(500).render('app/500.njk');
		}

		const mappedPageContents = changeNotificationMethodsPage(
			currentAppeal,
			lpaQuestionnaire,
			lpaNotificationMethods,
			request.session.notificationMethods,
			`/appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}`
		);

		delete request.session.notificationMethods;

		return response.status(200).render('patterns/change-page.pattern.njk', {
			pageContent: mappedPageContents,
			errors
		});
	} catch (error) {
		logger.error(error);
		delete request.session.notificationMethods;
		return response.status(500).render('app/500.njk');
	}
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postChangeNotificationMethods = async (request, response) => {
	const {
		currentAppeal,
		params: { appealId, lpaQuestionnaireId }
	} = request;

	if (request.errors) {
		return renderChangeNotificationMethods(request, response);
	}

	request.session.notificationMethods = [];

	const bodyValue = request.body['notificationMethodsCheckboxes'];

	if (bodyValue) {
		request.session.notificationMethods = ensureArray(bodyValue).map(
			(/** @type {string} */ notificationMethodId) => ({
				id: Number(notificationMethodId)
			})
		);
	}

	try {
		const lpaNotificationMethods = await getLpaNotificationMethods(request.apiClient);

		if (!lpaNotificationMethods) {
			return response.status(500).render('app/500.njk');
		}

		await changeNotificationMethods(
			request.apiClient,
			appealId,
			currentAppeal.lpaQuestionnaireId,
			request.session.notificationMethods
		);

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'changePage',
			appealId,
			text: `Notification methods updated`
		});

		delete request.session.notificationMethods;

		return response.redirect(
			`/appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}`
		);
	} catch (error) {
		logger.error(error);
	}
	return response.status(500).render('app/500.njk');
};
