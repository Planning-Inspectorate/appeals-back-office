import { convertFromYesNoNullToBooleanOrNull } from '#lib/boolean-formatter.js';
import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { getOriginPathname, isInternalUrl } from '#lib/url-utilities.js';
import { getLpaQuestionnaireFromId } from '../lpa-questionnaire.service.js';
import * as mapper from './is-gypsy-or-traveller-site.mapper.js';
import * as service from './is-gypsy-or-traveller-site.service.js';
/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeIsGypsyOrTravellerSite = async (request, response) => {
	return renderChangeIsGypsyOrTravellerSite(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderChangeIsGypsyOrTravellerSite = async (request, response) => {
	try {
		const { currentAppeal, session, errors, originalUrl, apiClient } = request;
		const origin = originalUrl.split('/').slice(0, -2).join('/');
		const data = await getLpaQuestionnaireFromId(
			apiClient,
			currentAppeal.appealId,
			currentAppeal.lpaQuestionnaireId
		);

		const currentRadioValue =
			convertFromYesNoNullToBooleanOrNull(session.isGypsyOrTravellerSite) ??
			data.isGypsyOrTravellerSite;
		const mappedPageContents = mapper.changeIsGypsyOrTravellerSite(
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
export const postChangeIsGypsyOrTravellerSite = async (request, response) => {
	request.session.isGypsyOrTravellerSite = request.body['isGypsyOrTravellerSiteRadio'];

	if (request.errors) {
		return renderChangeIsGypsyOrTravellerSite(request, response);
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

		await service.changeAffectsScheduledMonument(
			apiClient,
			appealId,
			currentAppeal.lpaQuestionnaireId,
			session.isGypsyOrTravellerSite
		);

		addNotificationBannerToSession({
			session,
			bannerDefinitionKey: 'changePage',
			appealId,
			text: 'Gypsy or Traveller communities status changed'
		});

		delete request.session.isGypsyOrTravellerSite;

		if (!origin.startsWith('/')) {
			throw new Error('unexpected originalUrl');
		} else {
			return response.redirect(origin);
		}
	} catch (error) {
		logger.error(error);
	}
	delete request.session.isGypsyOrTravellerSite;
	return response.status(500).render('app/500.njk');
};
