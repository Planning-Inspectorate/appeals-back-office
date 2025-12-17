import { dayMonthYearHourMinuteToISOString } from '#lib/dates.js';
import logger from '#lib/logger.js';
import { objectContainsAllKeys } from '#lib/object-utilities.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { HTTPError } from 'got';
import { getAppellantCaseFromAppealId } from '../appellant-case.service.js';
import { changeEnforcementIssueDatePage } from './enforcement-issue-date.mapper.js';
import { changeEnforcementIssueDate } from './enforcement-issue-date.service.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeEnforcementIssueDate = async (request, response) => {
	return renderChangeEnforcementIssueDate(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderChangeEnforcementIssueDate = async (request, response) => {
	try {
		const { errors, currentAppeal, apiClient, body } = request;
		const appellantCaseData = await getAppellantCaseFromAppealId(
			apiClient,
			currentAppeal.appealId,
			currentAppeal.appellantCaseId
		);

		const dateEntered = {
			day: body['enforcement-issue-date-day'] || '',
			month: body['enforcement-issue-date-month'] || '',
			year: body['enforcement-issue-date-year'] || ''
		};

		const mappedPageContents = changeEnforcementIssueDatePage(
			currentAppeal,
			appellantCaseData,
			errors,
			dateEntered
		);

		return response
			.status(errors ? 400 : 200)
			.render('patterns/change-page.pattern.njk', { pageContent: mappedPageContents, errors });
	} catch (error) {
		logger.error(error);
		delete request.session.enforcementIssueDate;
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
export const postChangeEnforcementIssueDate = async (request, response) => {
	if (request.errors) {
		return renderChangeEnforcementIssueDate(request, response);
	}

	if (
		!objectContainsAllKeys(request.body, [
			'enforcement-issue-date-day',
			'enforcement-issue-date-month',
			'enforcement-issue-date-year'
		])
	) {
		return response.status(500).render('app/500.njk');
	}

	try {
		const updatedApplicationDateDay = parseInt(request.body['enforcement-issue-date-day'], 10);
		const updatedApplicationDateMonth = parseInt(request.body['enforcement-issue-date-month'], 10);
		const updatedApplicationDateYear = parseInt(request.body['enforcement-issue-date-year'], 10);

		if (
			Number.isNaN(updatedApplicationDateDay) ||
			Number.isNaN(updatedApplicationDateMonth) ||
			Number.isNaN(updatedApplicationDateYear)
		) {
			return response.status(500).render('app/500.njk');
		}

		const { currentAppeal, apiClient } = request;

		const { appealId, appellantCaseId } = currentAppeal;

		await changeEnforcementIssueDate(
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
			text: 'Appeal updated'
		});

		return response.redirect(
			`/appeals-service/appeal-details/${currentAppeal.appealId}/appellant-case`
		);
	} catch (error) {
		logger.error(error);
	}

	return response.status(500).render('app/500.njk');
};
