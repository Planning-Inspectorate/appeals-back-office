import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { HTTPError } from 'got';
import { getAppellantCaseFromAppealId } from '../appellant-case.service.js';
import { changeAppealCostsApplicationPage } from './appeal-costs-application.mapper.js';
import { changeAppealCostsApplication } from './appeal-costs-application.service.js';
import { getOriginPathname, isInternalUrl } from '#lib/url-utilities.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeAppealCostsApplication = async (request, response) => {
	return renderChangeAppealCostsApplication(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderChangeAppealCostsApplication = async (request, response) => {
	try {
		const { errors, currentAppeal, apiClient } = request;
		const appellantCaseData = await getAppellantCaseFromAppealId(
			apiClient,
			currentAppeal.appealId,
			currentAppeal.appellantCaseId
		);

		const mappedPageContents = changeAppealCostsApplicationPage(
			currentAppeal,
			appellantCaseData,
			request.session.applicationDecisionDate
		);

		delete request.session.applicationDecisionDate;

		return response
			.status(200)
			.render('patterns/change-page.pattern.njk', { pageContent: mappedPageContents, errors });
	} catch (error) {
		logger.error(error);
		delete request.session.applicationDecisionDate;
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
export const postChangeAppealCostsApplication = async (request, response) => {
	request.session.appellantCostsApplication = request.body['appealCostsApplicationRadio'];

	if (request.errors) {
		return renderChangeAppealCostsApplication(request, response);
	}

	try {
		const {
			apiClient,
			params: { appealId },
			currentAppeal,
			session
		} = request;

		const currentUrl = getOriginPathname(request);
		const origin = currentUrl.split('/').slice(0, -3).join('/');

		if (!isInternalUrl(origin, request)) {
			return response.status(400).render('errorPageTemplate', {
				message: 'Invalid redirection attempt detected.'
			});
		}

		await changeAppealCostsApplication(
			apiClient,
			appealId,
			currentAppeal.appellantCaseId,
			session.appellantCostsApplication
		);

		addNotificationBannerToSession(
			session,
			'changePage',
			appealId,
			undefined,
			'Appeal costs applied for updated'
		);

		delete request.session.appellantCostsApplication;

		if (!origin.startsWith('/')) {
			throw new Error('unexpected originalUrl');
		} else {
			return response.redirect(origin);
		}
	} catch (error) {
		logger.error(error);
	}
	delete request.session.appellantCostsApplication;
	return response.status(500).render('app/500.njk');
};
