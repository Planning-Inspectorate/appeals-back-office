import { dayMonthYearHourMinuteToISOString } from '#lib/dates.js';
import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { HTTPError } from 'got';
import { getAppellantCaseFromAppealId } from '../appellant-case.service.js';
import { changeApplicationDecisionDatePage } from './application-decision-date.mapper.js';
import { changeApplicationDecisionDate } from './application-decision-date.service.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeApplicationDecisionDate = async (request, response) => {
	return renderChangeApplicationDecisionDate(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderChangeApplicationDecisionDate = async (request, response) => {
	try {
		const { errors, currentAppeal, apiClient } = request;
		const appellantCaseData = await getAppellantCaseFromAppealId(
			apiClient,
			currentAppeal.appealId,
			currentAppeal.appellantCaseId
		);

		const mappedPageContents = changeApplicationDecisionDatePage(
			currentAppeal,
			appellantCaseData,
			request.session.applicationDecisionDate,
			errors
		);

		return response
			.status(200)
			.render('patterns/change-page.pattern.njk', { pageContent: mappedPageContents, errors });
	} catch (error) {
		logger.error(error);
		delete request.session.applicationDecisionDate;
		if (error instanceof HTTPError && error.response.statusCode === 404) {
			return response.status(404).render('app/404.njk');
		} else {
			return response.status(500).render('app/500.njk');
		}
	}
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postChangeApplicationDecisionDate = async (request, response) => {
	request.session.applicationDecisionDate = {
		...request.session.applicationDecisionDate,
		day: request.body['application-decision-date-day'],
		month: request.body['application-decision-date-month'],
		year: request.body['application-decision-date-year']
	};

	if (request.errors) {
		return renderChangeApplicationDecisionDate(request, response);
	}

	try {
		const { currentAppeal, apiClient, session } = request;

		const { appealId, appellantCaseId } = currentAppeal;

		const updatedApplicationDecisionDay = parseInt(session.applicationDecisionDate.day, 10);
		const updatedApplicationDecisionMonth = parseInt(session.applicationDecisionDate.month, 10);
		const updatedApplicationDecisionYear = parseInt(session.applicationDecisionDate.year, 10);

		if (
			Number.isNaN(updatedApplicationDecisionDay) ||
			Number.isNaN(updatedApplicationDecisionMonth) ||
			Number.isNaN(updatedApplicationDecisionYear)
		) {
			return response.status(400).render('app/500.njk');
		}

		await changeApplicationDecisionDate(
			apiClient,
			appealId,
			appellantCaseId,
			dayMonthYearHourMinuteToISOString({
				day: updatedApplicationDecisionDay,
				month: updatedApplicationDecisionMonth,
				year: updatedApplicationDecisionYear
			})
		);

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'changePage',
			appealId,
			text: 'Application decision date changed'
		});

		delete request.session.applicationDecisionDate;

		return response.redirect(
			`/appeals-service/appeal-details/${currentAppeal.appealId}/appellant-case`
		);
	} catch (error) {
		logger.error(error);
	}

	return response.status(500).render('app/500.njk');
};
