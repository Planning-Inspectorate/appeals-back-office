import { convertFromYesNoNullToBooleanOrNull } from '#lib/boolean-formatter.js';
import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { getOriginPathname, isInternalUrl } from '#lib/url-utilities.js';
import { getLpaQuestionnaireFromId } from '../lpa-questionnaire.service.js';
import * as mapper from './special-control-of-advertisement.mapper.js';
import * as service from './special-control-of-advertisement.service.js';
/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeSpecialControlOfAdvertisment = async (request, response) => {
	return renderChangeSpecialControlOfAdvertisment(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderChangeSpecialControlOfAdvertisment = async (request, response) => {
	try {
		const { currentAppeal, session, errors, originalUrl, apiClient } = request;
		const origin = originalUrl.split('/').slice(0, -2).join('/');
		const data = await getLpaQuestionnaireFromId(
			apiClient,
			currentAppeal.appealId,
			currentAppeal.lpaQuestionnaireId
		);

		const currentRadioValue =
			convertFromYesNoNullToBooleanOrNull(session.isSiteInAreaOfSpecialControlAdverts) ??
			data.isSiteInAreaOfSpecialControlAdverts;

		const mappedPageContents = mapper.changeSpecialControlOfAdvertisment(
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
export const postChangeSpecialControlOfAdvertisment = async (request, response) => {
	request.session.specialControlOfAdvertisementRadio =
		request.body['specialControlOfAdvertisementRadio'];

	if (request.errors) {
		return renderChangeSpecialControlOfAdvertisment(request, response);
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

		await service.changeSpecialControlOfAdvertisment(
			apiClient,
			appealId,
			currentAppeal.lpaQuestionnaireId,
			session.specialControlOfAdvertisementRadio
		);

		addNotificationBannerToSession({
			session,
			bannerDefinitionKey: 'changePage',
			appealId,
			text: 'Special control of advertisements status changed'
		});

		delete request.session.specialControlOfAdvertisementRadio;

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
