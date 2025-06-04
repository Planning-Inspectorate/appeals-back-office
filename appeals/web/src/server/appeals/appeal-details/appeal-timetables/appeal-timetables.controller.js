import logger from '#lib/logger.js';
import { objectContainsAllKeys } from '#lib/object-utilities.js';
import { setAppealTimetables } from './appeal-timetables.service.js';
import {
	routeToObjectMapper,
	mapUpdateDueDatePage,
	apiErrorMapper
} from './appeal-timetables.mapper.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { dayMonthYearHourMinuteToISOString } from '#lib/dates.js';

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * @param {import("@pins/express").ValidationErrors | undefined} [apiErrors]

 */
const renderUpdateDueDate = async (request, response, apiErrors) => {
	const appealDetails = request.currentAppeal;

	if (!appealDetails) {
		return response.status(404).render('app/404.njk');
	}

	const appealId = appealDetails.appealId;
	const { timetableType } = request.params;

	let errors = request.errors || apiErrors;

	const timetableProperty = routeToObjectMapper[timetableType];
	const mappedPageContent = mapUpdateDueDatePage(
		appealDetails?.appealTimetable,
		timetableProperty,
		appealDetails,
		errors
	);

	if (!appealId || !timetableProperty || !mappedPageContent) {
		return response.status(500).render('app/500.njk');
	}

	return response.status(200).render('appeals/appeal/update-date.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const processUpdateDueDate = async (request, response) => {
	if (request.errors) {
		return renderUpdateDueDate(request, response);
	}

	const { body } = request;
	const appealDetails = request.currentAppeal;
	const appealId = appealDetails.appealId;
	const { appealTimetableId } = appealDetails.appealTimetable;
	const { timetableType } = request.params;

	if (!objectContainsAllKeys(body, ['due-date-day', 'due-date-month', 'due-date-year'])) {
		return response.status(500).render('app/500.njk');
	}

	try {
		const updatedDueDateDay = parseInt(body['due-date-day'], 10);
		const updatedDueDateMonth = parseInt(body['due-date-month'], 10);
		const updatedDueDateYear = parseInt(body['due-date-year'], 10);

		if (
			Number.isNaN(updatedDueDateDay) ||
			Number.isNaN(updatedDueDateMonth) ||
			Number.isNaN(updatedDueDateYear)
		) {
			return response.status(500).render('app/500.njk');
		}

		const updatedDueDateDayString = `0${updatedDueDateDay}`.slice(-2);
		const updatedDueDateMonthString = `0${updatedDueDateMonth}`.slice(-2);

		const timetableProperty = routeToObjectMapper[timetableType];

		const setAppealTimetableResponse = await setAppealTimetables(
			request.apiClient,
			appealId,
			appealTimetableId,
			{
				[timetableProperty]: dayMonthYearHourMinuteToISOString({
					year: updatedDueDateYear,
					month: updatedDueDateMonthString,
					day: updatedDueDateDayString
				})
			}
		);

		if (setAppealTimetableResponse.errors) {
			const apiError = Object.values(setAppealTimetableResponse.errors)[0];
			if (apiError) {
				const apiErrors = apiErrorMapper(updatedDueDateDay, apiError);

				return renderUpdateDueDate(request, response, apiErrors);
			} else {
				return response.status(500).render('app/500.njk');
			}
		}
		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'timetableDueDateUpdated',
			appealId
		});

		return response.redirect(`/appeals-service/appeal-details/${appealId}`);
	} catch (error) {
		logger.error(
			error,
			error instanceof Error ? error.message : 'Something went wrong when changing appeal timetable'
		);

		return response.status(500).render('app/500.njk');
	}
};

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getDueDate = async (request, response) => {
	renderUpdateDueDate(request, response);
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postDueDate = async (request, response) => {
	processUpdateDueDate(request, response);
};
