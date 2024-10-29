import { convertFromYesNoNullToBooleanOrNull } from '#lib/boolean-formatter.js';
import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { getOriginPathname, isInternalUrl } from '#lib/url-utilities.js';
import { getLpaQuestionnaireFromId } from '../lpa-questionnaire.service.js';
import * as mapper from './affects-scheduled-monument.mapper.js';
import * as service from './affects-scheduled-monument.service.js';
/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeAffectsScheduledMonument = async (request, response) => {
	return renderChangeAffectsScheduledMonument(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderChangeAffectsScheduledMonument = async (request, response) => {
	try {
		const { currentAppeal, session, errors, originalUrl, apiClient } = request;
		const origin = originalUrl.split('/').slice(0, -2).join('/');
		const data = await getLpaQuestionnaireFromId(
			apiClient,
			currentAppeal.appealId,
			currentAppeal.lpaQuestionnaireId
		);

		const currentRadioValue =
			convertFromYesNoNullToBooleanOrNull(session.affectsScheduledMonument) ??
			data.affectsScheduledMonument;
		const mappedPageContents = mapper.changeAffectsScheduledMonument(
			currentAppeal,
			currentRadioValue?.toString() || '',
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
export const postChangeAffectsScheduledMonument = async (request, response) => {
	request.session.affectsScheduledMonument = request.body['affectsScheduledMonumentRadio'];

	if (request.errors) {
		return renderChangeAffectsScheduledMonument(request, response);
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
			session.affectsScheduledMonument
		);

		addNotificationBannerToSession(
			session,
			'changePage',
			appealId,
			'',
			'Scheduled monument status changed '
		);

		delete request.session.affectsScheduledMonument;

		if (!origin.startsWith('/')) {
			throw new Error('unexpected originalUrl');
		} else {
			return response.redirect(origin);
		}
	} catch (error) {
		logger.error(error);
	}
	delete request.session.affectsScheduledMonument;
	return response.status(500).render('app/500.njk');
};
