import { convertFromYesNoNullToBooleanOrNull } from '#lib/boolean-formatter.js';
import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { getOriginPathname, isInternalUrl } from '#lib/url-utilities.js';
import { getLpaQuestionnaireFromId } from '../lpa-questionnaire.service.js';
import * as mapper from './has-community-infrastructure-levy.mapper.js';
import * as service from './has-community-infrastructure-levy.service.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderChangeHasCommunityInfrastructureLevy = async (request, response) => {
	try {
		const { currentAppeal, session, errors, originalUrl, apiClient } = request;
		const origin = originalUrl.split('/').slice(0, -2).join('/');
		const lpaQuestionnaireData = await getLpaQuestionnaireFromId(
			apiClient,
			currentAppeal.appealId,
			currentAppeal.lpaQuestionnaireId
		);

		const mappedPageContents = mapper.changeHasCommunityInfrastructureLevy(
			currentAppeal,
			convertFromYesNoNullToBooleanOrNull(session.hasCommunityInfrastructureLevy) ??
				lpaQuestionnaireData.hasInfrastructureLevy,
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
export const getChangeHasCommunityInfrastructureLevy = renderChangeHasCommunityInfrastructureLevy;

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postChangeHasCommunityInfrastructureLevy = async (request, response) => {
	try {
		const {
			apiClient,
			params: { appealId },
			currentAppeal,
			session,
			errors
		} = request;

		if (errors) {
			return renderChangeHasCommunityInfrastructureLevy(request, response);
		}

		session.hasCommunityInfrastructureLevy = request.body['hasCommunityInfrastructureLevyRadio'];

		const currentUrl = getOriginPathname(request);
		const origin = currentUrl.split('/').slice(0, -2).join('/');

		if (!isInternalUrl(origin, request)) {
			return response.status(400).render('errorPageTemplate', {
				message: 'Invalid redirection attempt detected.'
			});
		}

		await service.changeHasCommunityInfrastructureLevy(
			apiClient,
			appealId,
			currentAppeal.lpaQuestionnaireId,
			session.hasCommunityInfrastructureLevy
		);

		addNotificationBannerToSession(
			session,
			'changePage',
			appealId,
			'',
			'Community infrastructure levy status changed'
		);

		delete request.session.hasCommunityInfrastructureLevy;

		if (!origin.startsWith('/')) {
			throw new Error('unexpected originalUrl');
		} else {
			return response.redirect(origin);
		}
	} catch (error) {
		logger.error(error);
	}

	delete request.session.hasCommunityInfrastructureLevy;

	return response.status(500).render('app/500.njk');
};
