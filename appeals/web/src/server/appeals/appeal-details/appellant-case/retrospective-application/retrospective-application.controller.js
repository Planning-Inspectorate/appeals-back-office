import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { HTTPError } from 'got';
import { getAppellantCaseFromAppealId } from '../appellant-case.service.js';
import { changeRetrospectiveApplicationPage } from './retrospective-application.mapper.js';
import { changeRetrospectiveApplication } from './retrospective-application.service.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeRetrospectiveApplication = async (request, response) => {
	return renderChangeRetrospectiveApplication(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderChangeRetrospectiveApplication = async (request, response) => {
	try {
		const { errors, currentAppeal } = request;

		const appellantCaseData = await getAppellantCaseFromAppealId(
			request.apiClient,
			currentAppeal.appealId,
			currentAppeal.appellantCaseId
		);

		const mappedPageContents = changeRetrospectiveApplicationPage(
			currentAppeal,
			appellantCaseData,
			request.session.retrospectiveApplication,
			errors
		);

		delete request.session.retrospectiveApplication;

		return response.status(200).render('patterns/change-page.pattern.njk', {
			pageContent: mappedPageContents,
			errors
		});
	} catch (error) {
		logger.error(error);
		delete request.session.retrospectiveApplication;
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
export const postChangeRetrospectiveApplication = async (request, response) => {
	if (request.errors) {
		return renderChangeRetrospectiveApplication(request, response);
	}

	const retrospectiveApplication = request.body.retrospectiveApplication === 'yes';

	const {
		params: { appealId },
		currentAppeal,
		apiClient
	} = request;

	request.session.retrospectiveApplication = request.body['retrospectiveApplication'] === 'yes';

	const appellantCaseId = currentAppeal.appellantCaseId;

	try {
		await changeRetrospectiveApplication(
			apiClient,
			appealId,
			appellantCaseId,
			retrospectiveApplication
		);

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'changePage',
			appealId,
			text: 'Appeal updated'
		});

		delete request.session.retrospectiveApplication;

		return response.redirect(
			`/appeals-service/appeal-details/${currentAppeal.appealId}/appellant-case`
		);
	} catch (error) {
		logger.error(error);
		return response.status(500).render('app/500.njk');
	}
};
