import { dayMonthYearHourMinuteToISOString } from '#lib/dates.js';
import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { getOriginPathname, isInternalUrl } from '#lib/url-utilities.js';
import { getLpaQuestionnaireFromId } from '../../lpa-questionnaire.service.js';
import * as mapper from './infrastructure-levy-adopted-date.mapper.js';
import * as service from './infrastructure-levy-adopted-date.service.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderChangeInfrastructureLevyAdoptedDate = async (request, response) => {
	try {
		const { currentAppeal, session, errors, originalUrl, apiClient } = request;
		const origin = originalUrl.split('/').slice(0, -2).join('/');
		const lpaQuestionnaireData = await getLpaQuestionnaireFromId(
			apiClient,
			currentAppeal.appealId,
			currentAppeal.lpaQuestionnaireId
		);

		const mappedPageContents = mapper.changeInfrastructureLevyAdoptedDate(
			currentAppeal,
			dayMonthYearHourMinuteToISOString(session.infrastructureLevyAdoptedDate) ||
				lpaQuestionnaireData.infrastructureLevyAdoptedDate ||
				null,
			origin,
			errors
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
export const getChangeInfrastructureLevyAdoptedDate = renderChangeInfrastructureLevyAdoptedDate;

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postChangeInfrastructureLevyAdoptedDate = async (request, response) => {
	try {
		const {
			apiClient,
			params: { appealId },
			currentAppeal,
			session,
			errors
		} = request;

		if (errors) {
			return renderChangeInfrastructureLevyAdoptedDate(request, response);
		}

		/** @type {import('#lib/dates.js').DayMonthYearHourMinute} */
		session.infrastructureLevyAdoptedDate = {
			day: request.body['levy-adopted-date-day'],
			month: request.body['levy-adopted-date-month'],
			year: request.body['levy-adopted-date-year']
		};

		const currentUrl = getOriginPathname(request);
		const origin = currentUrl.split('/').slice(0, -2).join('/');

		if (!isInternalUrl(origin, request)) {
			return response.status(400).render('errorPageTemplate', {
				message: 'Invalid redirection attempt detected.'
			});
		}

		await service.changeInfrastructureLevyAdoptedDate(
			apiClient,
			appealId,
			currentAppeal.lpaQuestionnaireId,
			session.infrastructureLevyAdoptedDate
		);

		addNotificationBannerToSession({
			session,
			bannerDefinitionKey: 'changePage',
			appealId,
			text: 'Levy adoption date changed'
		});

		delete request.session.infrastructureLevyAdoptedDate;

		if (!origin.startsWith('/')) {
			throw new Error('unexpected originalUrl');
		} else {
			return response.redirect(origin);
		}
	} catch (error) {
		logger.error(error);
	}

	delete request.session.infrastructureLevyAdoptedDate;

	return response.status(500).render('app/500.njk');
};
