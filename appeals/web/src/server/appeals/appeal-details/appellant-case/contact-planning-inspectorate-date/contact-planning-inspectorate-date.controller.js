import { dayMonthYearHourMinuteToISOString } from '#lib/dates.js';
import logger from '#lib/logger.js';
import { objectContainsAllKeys } from '#lib/object-utilities.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { HTTPError } from 'got';
import { getAppellantCaseFromAppealId } from '../appellant-case.service.js';
import { changeContactPlanningInspectorateDatePage } from './contact-planning-inspectorate-date.mapper.js';
import { changeContactPlanningInspectorateDate } from './contact-planning-inspectorate-date.service.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeContactPlanningInspectorateDate = async (request, response) => {
	return renderChangeContactPlanningInspectorateDate(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderChangeContactPlanningInspectorateDate = async (request, response) => {
	try {
		const { errors, currentAppeal, apiClient, body } = request;
		const appellantCaseData = await getAppellantCaseFromAppealId(
			apiClient,
			currentAppeal.appealId,
			currentAppeal.appellantCaseId
		);

		const dateEntered = {
			day: body['contact-planning-inspectorate-date-day'] || '',
			month: body['contact-planning-inspectorate-date-month'] || '',
			year: body['contact-planning-inspectorate-date-year'] || ''
		};

		const mappedPageContents = changeContactPlanningInspectorateDatePage(
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
		delete request.session.contactPlanningInspectorateDate;
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
export const postChangeContactPlanningInspectorateDate = async (request, response) => {
	if (request.errors) {
		return renderChangeContactPlanningInspectorateDate(request, response);
	}

	if (
		!objectContainsAllKeys(request.body, [
			'contact-planning-inspectorate-date-day',
			'contact-planning-inspectorate-date-month',
			'contact-planning-inspectorate-date-year'
		])
	) {
		return response.status(500).render('app/500.njk');
	}

	try {
		const updatedApplicationDateDay = parseInt(
			request.body['contact-planning-inspectorate-date-day'],
			10
		);
		const updatedApplicationDateMonth = parseInt(
			request.body['contact-planning-inspectorate-date-month'],
			10
		);
		const updatedApplicationDateYear = parseInt(
			request.body['contact-planning-inspectorate-date-year'],
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

		await changeContactPlanningInspectorateDate(
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
