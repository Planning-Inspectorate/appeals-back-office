import { dayMonthYearHourMinuteToISOString } from '#lib/dates.js';
import logger from '#lib/logger.js';
import { objectContainsAllKeys } from '#lib/object-utilities.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { HTTPError } from 'got';
import { getAppellantCaseFromAppealId } from '../appellant-case.service.js';
import { changeApplicationSubmissionDatePage } from './application-submission-date.mapper.js';
import { changeApplicationSubmissionDate } from './application-submission-date.service.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeApplicationSubmissionDate = async (request, response) => {
	return renderChangeApplicationSubmissionDate(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderChangeApplicationSubmissionDate = async (request, response) => {
	try {
		const { errors, currentAppeal, apiClient } = request;
		const appellantCaseData = await getAppellantCaseFromAppealId(
			apiClient,
			currentAppeal.appealId,
			currentAppeal.appellantCaseId
		);

		const mappedPageContents = changeApplicationSubmissionDatePage(
			currentAppeal,
			appellantCaseData,
			request.session.applicationSubmissionDate,
			errors
		);

		delete request.session.applicationSubmissionDate;

		return response
			.status(200)
			.render('patterns/change-page.pattern.njk', { pageContent: mappedPageContents, errors });
	} catch (error) {
		logger.error(error);
		delete request.session.applicationSubmissionDate;
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
export const postChangeApplicationSubmissionDate = async (request, response) => {
	if (request.errors) {
		return renderChangeApplicationSubmissionDate(request, response);
	}

	if (
		!objectContainsAllKeys(request.body, [
			'application-submission-date-day',
			'application-submission-date-month',
			'application-submission-date-year'
		])
	) {
		return response.status(500).render('app/500.njk');
	}

	try {
		const updatedApplicationDateDay = parseInt(request.body['application-submission-date-day'], 10);
		const updatedApplicationDateMonth = parseInt(
			request.body['application-submission-date-month'],
			10
		);
		const updatedApplicationDateYear = parseInt(
			request.body['application-submission-date-year'],
			10
		);

		if (
			Number.isNaN(updatedApplicationDateDay) ||
			Number.isNaN(updatedApplicationDateMonth) ||
			Number.isNaN(updatedApplicationDateYear)
		) {
			return response.status(500).render('app/500.njk');
		}

		const { currentAppeal, apiClient } = request;

		const { appealId, appellantCaseId } = currentAppeal;

		await changeApplicationSubmissionDate(
			apiClient,
			appealId,
			appellantCaseId,
			dayMonthYearHourMinuteToISOString({
				day: updatedApplicationDateDay,
				month: updatedApplicationDateMonth,
				year: updatedApplicationDateYear
			})
		);

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'changePage',
			appealId,
			text: 'Date application submitted updated'
		});

		return response.redirect(
			`/appeals-service/appeal-details/${currentAppeal.appealId}/appellant-case`
		);
	} catch (error) {
		logger.error(error);
	}

	return response.status(500).render('app/500.njk');
};
