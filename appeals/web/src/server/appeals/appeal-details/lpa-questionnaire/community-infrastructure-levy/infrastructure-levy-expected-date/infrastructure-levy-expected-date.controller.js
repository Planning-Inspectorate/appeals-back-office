import { dayMonthYearHourMinuteToISOString } from '#lib/dates.js';
import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { getOriginPathname, isInternalUrl } from '#lib/url-utilities.js';
import { getLpaQuestionnaireFromId } from '../../lpa-questionnaire.service.js';
import * as mapper from './infrastructure-levy-expected-date.mapper.js';
import * as service from './infrastructure-levy-expected-date.service.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderChangeInfrastructureLevyExpectedDate = async (request, response) => {
	try {
		const { currentAppeal, session, errors, originalUrl, apiClient } = request;
		const origin = originalUrl.split('/').slice(0, -2).join('/');
		const lpaQuestionnaireData = await getLpaQuestionnaireFromId(
			apiClient,
			currentAppeal.appealId,
			currentAppeal.lpaQuestionnaireId
		);

		const mappedPageContents = mapper.changeInfrastructureLevyExpectedDate(
			currentAppeal,
			dayMonthYearHourMinuteToISOString(session.infrastructureLevyExpectedDate) ||
				lpaQuestionnaireData.infrastructureLevyExpectedDate ||
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
export const getChangeInfrastructureLevyExpectedDate = renderChangeInfrastructureLevyExpectedDate;

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postChangeInfrastructureLevyExpectedDate = async (request, response) => {
	try {
		const {
			apiClient,
			params: { appealId },
			currentAppeal,
			session,
			errors
		} = request;

		if (errors) {
			return renderChangeInfrastructureLevyExpectedDate(request, response);
		}

		/** @type {import('#lib/dates.js').DayMonthYearHourMinute} */
		session.infrastructureLevyExpectedDate = {
			day: request.body['levy-expected-date-day'],
			month: request.body['levy-expected-date-month'],
			year: request.body['levy-expected-date-year']
		};

		const currentUrl = getOriginPathname(request);
		const origin = currentUrl.split('/').slice(0, -2).join('/');

		if (!isInternalUrl(origin, request)) {
			return response.status(400).render('errorPageTemplate', {
				message: 'Invalid redirection attempt detected.'
			});
		}

		await service.changeInfrastructureLevyExpectedDate(
			apiClient,
			appealId,
			currentAppeal.lpaQuestionnaireId,
			session.infrastructureLevyExpectedDate
		);

		addNotificationBannerToSession({
			session,
			bannerDefinitionKey: 'changePage',
			appealId,
			text: 'Expected levy adoption date changed'
		});

		delete request.session.infrastructureLevyExpectedDate;

		if (!origin.startsWith('/')) {
			throw new Error('unexpected originalUrl');
		} else {
			return response.redirect(origin);
		}
	} catch (error) {
		logger.error(error);
	}

	delete request.session.infrastructureLevyExpectedDate;

	return response.status(500).render('app/500.njk');
};
