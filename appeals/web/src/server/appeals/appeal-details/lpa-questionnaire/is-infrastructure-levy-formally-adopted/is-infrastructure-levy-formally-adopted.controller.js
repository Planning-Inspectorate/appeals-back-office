import { convertFromYesNoNullToBooleanOrNull } from '#lib/boolean-formatter.js';
import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { getOriginPathname, isInternalUrl } from '#lib/url-utilities.js';
import { getLpaQuestionnaireFromId } from '../lpa-questionnaire.service.js';
import * as mapper from './is-infrastructure-levy-formally-adopted.mapper.js';
import * as service from './is-infrastructure-levy-formally-adopted.service.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderChangeIsInfrastructureLevyFormallyAdopted = async (request, response) => {
	try {
		const { currentAppeal, session, errors, originalUrl, apiClient } = request;
		const origin = originalUrl.split('/').slice(0, -2).join('/');
		const lpaQuestionnaireData = await getLpaQuestionnaireFromId(
			apiClient,
			currentAppeal.appealId,
			currentAppeal.lpaQuestionnaireId
		);

		const mappedPageContents = mapper.changeIsInfrastructureLevyFormallyAdopted(
			currentAppeal,
			convertFromYesNoNullToBooleanOrNull(session.isInfrastructureLevyFormallyAdopted) ??
				lpaQuestionnaireData.isInfrastructureLevyFormallyAdopted,
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
export const getChangeIsInfrastructureLevyFormallyAdopted =
	renderChangeIsInfrastructureLevyFormallyAdopted;

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postChangeIsInfrastructureLevyFormallyAdopted = async (request, response) => {
	try {
		const {
			apiClient,
			params: { appealId },
			currentAppeal,
			session,
			errors
		} = request;

		if (errors) {
			return renderChangeIsInfrastructureLevyFormallyAdopted(request, response);
		}

		session.isInfrastructureLevyFormallyAdopted =
			request.body['isInfrastructureLevyFormallyAdoptedRadio'];

		const currentUrl = getOriginPathname(request);
		const origin = currentUrl.split('/').slice(0, -2).join('/');

		if (!isInternalUrl(origin, request)) {
			return response.status(400).render('errorPageTemplate', {
				message: 'Invalid redirection attempt detected.'
			});
		}

		await service.changeIsInfrastructureLevyFormallyAdopted(
			apiClient,
			appealId,
			currentAppeal.lpaQuestionnaireId,
			session.isInfrastructureLevyFormallyAdopted
		);

		addNotificationBannerToSession({
			session,
			bannerDefinitionKey: 'changePage',
			appealId,
			text: 'Levy formally adopted status changed'
		});

		delete request.session.isInfrastructureLevyFormallyAdopted;

		if (!origin.startsWith('/')) {
			throw new Error('unexpected originalUrl');
		} else {
			return response.redirect(origin);
		}
	} catch (error) {
		logger.error(error);
	}

	delete request.session.isInfrastructureLevyFormallyAdopted;

	return response.status(500).render('app/500.njk');
};
