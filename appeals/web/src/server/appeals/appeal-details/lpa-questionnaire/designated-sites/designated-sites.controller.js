import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { getOriginPathname, isInternalUrl } from '#lib/url-utilities.js';
import { getLpaQuestionnaireFromId } from '../lpa-questionnaire.service.js';
import * as mapper from './designated-sites.mapper.js';
import * as service from './designated-sites.service.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderChangeInNearOrLikelyToAffectDesignatedSites = async (request, response) => {
	try {
		const { currentAppeal, session, errors, originalUrl, apiClient } = request;
		const origin = originalUrl.split('/').slice(0, -2).join('/');

		const [lpaQuestionnaireData, designatedSiteNames] = await Promise.all([
			getLpaQuestionnaireFromId(
				apiClient,
				currentAppeal.appealId,
				currentAppeal.lpaQuestionnaireId
			),
			service.getDesignatedSiteNames(request.apiClient)
		]);

		const mappedPageContents = mapper.changeInNearOrLikelyToAffectDesignatedSites(
			currentAppeal,
			designatedSiteNames,
			session.inNearOrLikelyToAffectDesignatedSites || lpaQuestionnaireData.designatedSiteNames,
			origin
		);

		return response.status(200).render('patterns/change-page.pattern.njk', {
			pageContent: mappedPageContents,
			errors
		});
	} catch (error) {
		logger.error(error);
	}

	return response.status(500).render('app/500.njk');
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeInNearOrLikelyToAffectDesignatedSites =
	renderChangeInNearOrLikelyToAffectDesignatedSites;

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postChangeInNearOrLikelyToAffectDesignatedSites = async (request, response) => {
	try {
		const {
			apiClient,
			params: { appealId },
			currentAppeal,
			session,
			errors
		} = request;

		if (errors) {
			return renderChangeInNearOrLikelyToAffectDesignatedSites(request, response);
		}

		/** @type {import('./designated-sites.mapper.js').InNearOrLikelyToAffectDesignatedSitesSessionData} */
		session.inNearOrLikelyToAffectDesignatedSites = mapper.mapChangePageFormDataToSessionData(
			request.body
		);

		const currentUrl = getOriginPathname(request);
		const origin = currentUrl.split('/').slice(0, -2).join('/');

		if (!isInternalUrl(origin, request)) {
			return response.status(400).render('errorPageTemplate', {
				message: 'Invalid redirection attempt detected.'
			});
		}

		const designatedSiteNames = await service.getDesignatedSiteNames(request.apiClient);

		/** @type {(import('@pins/appeals.api/src/server/openapi-types.js').DesignatedSiteName|undefined)[]} */
		const mappedInputData = mapper.mapChangePageSessionDataToPatchEndpointPayload(
			session.inNearOrLikelyToAffectDesignatedSites,
			designatedSiteNames
		);

		await service.changeInNearOrLikelyToAffectDesignatedSites(
			apiClient,
			appealId,
			currentAppeal.lpaQuestionnaireId,
			mappedInputData
		);

		addNotificationBannerToSession(
			session,
			'changePage',
			appealId,
			'',
			'In, near or likely to effect designated sites changed'
		);

		delete request.session.inNearOrLikelyToAffectDesignatedSites;

		if (!origin.startsWith('/')) {
			throw new Error('unexpected originalUrl');
		} else {
			return response.redirect(origin);
		}
	} catch (error) {
		logger.error(error);
	}

	delete request.session.inNearOrLikelyToAffectDesignatedSites;

	return response.status(500).render('app/500.njk');
};
