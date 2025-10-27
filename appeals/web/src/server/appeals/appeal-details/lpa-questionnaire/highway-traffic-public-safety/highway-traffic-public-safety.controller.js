import { convertFromYesNoNullToBooleanOrNull } from '#lib/boolean-formatter.js';
import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { getOriginPathname, isInternalUrl } from '#lib/url-utilities.js';
import { getLpaQuestionnaireFromId } from '../lpa-questionnaire.service.js';
import * as mapper from './highway-traffic-public-safety.mapper.js';
import * as service from './highway-traffic-public-safety.service.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeHighwayTrafficPublicSafety = async (request, response) => {
	return renderChangeHighwayTrafficPublicSafety(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderChangeHighwayTrafficPublicSafety = async (request, response) => {
	try {
		const { currentAppeal, session, errors, originalUrl, apiClient } = request;
		const origin = originalUrl.split('/').slice(0, -2).join('/');
		const data = await getLpaQuestionnaireFromId(
			apiClient,
			currentAppeal.appealId,
			currentAppeal.lpaQuestionnaireId
		);

		const currentRadioValue =
			convertFromYesNoNullToBooleanOrNull(session.highwayTrafficPublicSafetyRadio) ??
			data.wasApplicationRefusedDueToHighwayOrTraffic;

		const mappedPageContents = mapper.changeHighwayTrafficPublicSafety(
			currentAppeal,
			currentRadioValue,
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
export const postChangeHighwayTrafficPublicSafety = async (request, response) => {
	request.session.highwayTrafficPublicSafetyRadio = request.body['highwayTrafficPublicSafetyRadio'];

	if (request.errors) {
		return renderChangeHighwayTrafficPublicSafety(request, response);
	}

	try {
		const {
			apiClient,
			params: { appealId },
			currentAppeal,
			session
		} = request;

		const currentUrl = getOriginPathname(request);
		const origin = currentUrl.split('/').slice(0, -2).join('/');

		if (!isInternalUrl(origin, request)) {
			return response.status(400).render('errorPageTemplate', {
				message: 'Invalid redirection attempt detected.'
			});
		}

		await service.changeHighwayTrafficPublicSafety(
			apiClient,
			appealId,
			currentAppeal.lpaQuestionnaireId,
			session.highwayTrafficPublicSafetyRadio
		);

		addNotificationBannerToSession({
			session,
			bannerDefinitionKey: 'changePage',
			appealId,
			text: 'Highway or traffic public safety status changed'
		});

		delete request.session.highwayTrafficPublicSafetyRadio;

		if (!origin.startsWith('/')) {
			throw new Error('unexpected originalUrl');
		} else {
			return response.redirect(origin);
		}
	} catch (error) {
		logger.error(error);
	}
	delete request.session.hasProtectedSpecies;
	return response.status(500).render('app/500.njk');
};
