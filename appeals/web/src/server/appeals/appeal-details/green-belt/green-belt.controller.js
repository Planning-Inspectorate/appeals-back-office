import { convertFromYesNoNullToBooleanOrNull } from '#lib/boolean-formatter.js';
import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { getOriginPathname, isInternalUrl } from '#lib/url-utilities.js';
import { getAppellantCaseFromAppealId } from '../appellant-case/appellant-case.service.js';
import { getLpaQuestionnaireFromId } from '../lpa-questionnaire/lpa-questionnaire.service.js';
import { changeGreenBeltPage } from './green-belt.mapper.js';
import { changeGreenBeltAppellant, changeGreenBeltLPA } from './green-belt.service.js';
/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeGreenBelt = async (request, response) => {
	return renderChangeGreenBelt(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderChangeGreenBelt = async (request, response) => {
	try {
		const {
			currentAppeal,
			session,
			params: { source },
			errors,
			originalUrl,
			apiClient
		} = request;
		const origin = originalUrl.split('/').slice(0, -3).join('/');
		let data;
		if (source === 'lpa') {
			data = await getLpaQuestionnaireFromId(
				apiClient,
				currentAppeal.appealId,
				currentAppeal.lpaQuestionnaireId
			);
		} else {
			data = await getAppellantCaseFromAppealId(
				apiClient,
				currentAppeal.appealId,
				currentAppeal.appellantCaseId
			);
		}
		const currentRadioValue =
			convertFromYesNoNullToBooleanOrNull(session.isGreenBelt) ?? data.isGreenBelt;
		const mappedPageContents = changeGreenBeltPage(currentAppeal, currentRadioValue, origin);

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
export const postGreenBelt = async (request, response) => {
	request.session.isGreenBelt = request.body['greenBeltRadio'];

	if (request.errors) {
		return renderChangeGreenBelt(request, response);
	}

	try {
		const {
			apiClient,
			params: { appealId, source },
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

		if (source === 'lpa') {
			await changeGreenBeltLPA(
				apiClient,
				appealId,
				currentAppeal.lpaQuestionnaireId,
				session.isGreenBelt
			);
		} else {
			await changeGreenBeltAppellant(
				apiClient,
				appealId,
				currentAppeal.appellantCaseId,
				session.isGreenBelt
			);
		}

		addNotificationBannerToSession({
			session,
			bannerDefinitionKey: 'changePage',
			appealId,
			text: 'Green belt status updated'
		});

		delete request.session.isGreenBelt;

		if (!origin.startsWith('/')) {
			throw new Error('unexpected originalUrl');
		} else {
			return response.redirect(origin);
		}
	} catch (error) {
		logger.error(error);
	}
	delete request.session.isGreenBelt;
	return response.status(500).render('app/500.njk');
};
