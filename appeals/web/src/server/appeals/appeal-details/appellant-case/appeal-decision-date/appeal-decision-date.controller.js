import { dayMonthYearHourMinuteToISOString } from '#lib/dates.js';
import logger from '#lib/logger.js';
import { objectContainsAllKeys } from '#lib/object-utilities.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { HTTPError } from 'got';
import { getAppellantCaseFromAppealId } from '../appellant-case.service.js';
import { ChangeAppealDecisionDatePage } from './appeal-decision-date.mapper.js';
import { ChangeAppealDecisionDate } from './appeal-decision-date.service.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeAppealDecisionDate = async (request, response) => {
	return renderChangeAppealDecisionDate(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderChangeAppealDecisionDate = async (request, response) => {
	try {
		const { errors, currentAppeal, apiClient, body } = request;
		const appellantCaseData = await getAppellantCaseFromAppealId(
			apiClient,
			currentAppeal.appealId,
			currentAppeal.appellantCaseId
		);

		const dateEntered = {
			day: body['appeal-decision-date-day'] || '',
			month: body['appeal-decision-date-month'] || '',
			year: body['appeal-decision-date-year'] || ''
		};

		const mappedPageContents = ChangeAppealDecisionDatePage(
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
		delete request.session.appealDecisionDate;
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
export const postChangeAppealDecisionDate = async (request, response) => {
	if (request.errors) {
		return renderChangeAppealDecisionDate(request, response);
	}

	if (
		!objectContainsAllKeys(request.body, [
			'appeal-decision-date-day',
			'appeal-decision-date-month',
			'appeal-decision-date-year'
		])
	) {
		return response.status(500).render('app/500.njk');
	}

	try {
		const updatedApplicationDateDay = parseInt(request.body['appeal-decision-date-day'], 10);
		const updatedApplicationDateMonth = parseInt(request.body['appeal-decision-date-month'], 10);
		const updatedApplicationDateYear = parseInt(request.body['appeal-decision-date-year'], 10);

		if (
			Number.isNaN(updatedApplicationDateDay) ||
			Number.isNaN(updatedApplicationDateMonth) ||
			Number.isNaN(updatedApplicationDateYear)
		) {
			return response.status(500).render('app/500.njk');
		}

		const { currentAppeal, apiClient } = request;

		const { appealId, appellantCaseId } = currentAppeal;

		await ChangeAppealDecisionDate(
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
