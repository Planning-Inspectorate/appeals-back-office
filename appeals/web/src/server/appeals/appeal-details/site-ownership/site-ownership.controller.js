import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { HTTPError } from 'got';
import { getAppellantCaseFromAppealId } from '../appellant-case/appellant-case.service.js';
import { changeSiteOwnershipPage } from './site-ownership.mapper.js';
import { changeSiteOwnership } from './site-ownership.service.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeSiteOwnership = async (request, response) => {
	return renderChangeSiteOwnership(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderChangeSiteOwnership = async (request, response) => {
	try {
		const { errors, currentAppeal } = request;

		const appellantCaseData = await getAppellantCaseFromAppealId(
			request.apiClient,
			currentAppeal.appealId,
			currentAppeal.appellantCaseId
		);

		const mappedPageContents = changeSiteOwnershipPage(
			currentAppeal,
			appellantCaseData,
			request.session.siteOwnership
		);

		delete request.session.siteOwnership;

		return response.status(200).render('patterns/change-page.pattern.njk', {
			pageContent: mappedPageContents,
			errors
		});
	} catch (error) {
		logger.error(error);
		delete request.session.siteOwnership;
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
export const postChangeSiteOwnership = async (request, response) => {
	request.session.siteOwnership = {
		radio: request.body['siteOwnershipRadio']
	};

	if (request.errors) {
		return renderChangeSiteOwnership(request, response);
	}

	const {
		params: { appealId },
		currentAppeal
	} = request;

	const appellantCaseId = currentAppeal.appellantCaseId;

	try {
		await changeSiteOwnership(
			request.apiClient,
			appealId,
			appellantCaseId,
			request.session.siteOwnership
		);

		addNotificationBannerToSession(
			request.session,
			'changePage',
			appealId,
			undefined,
			'Site ownership updated'
		);

		delete request.session.siteOwnership;

		return response.redirect(
			`/appeals-service/appeal-details/${currentAppeal.appealId}/appellant-case`
		);
	} catch (error) {
		logger.error(error);
	}

	return response.status(500).render('app/500.njk');
};
