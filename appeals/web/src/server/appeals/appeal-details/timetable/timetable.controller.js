import logger from '#lib/logger.js';
import { objectContainsAllKeys } from '#lib/object-utilities.js';
import { setAppealTimetables } from './timetable.service.js';
import {
	mapEditTimetablePage,
	getAppealTimetableTypes,
	getIdText,
	getTimetableTypeText
} from './timetable.mapper.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import {
	dateISOStringToDisplayDate,
	dayMonthYearHourMinuteToISOString,
	setTimeInTimeZone
} from '#lib/dates.js';
import { renderCheckYourAnswersComponent } from '#lib/mappers/components/page-components/check-your-answers.js';
import { simpleHtmlComponent } from '#lib/mappers/index.js';
import { DEADLINE_HOUR, DEADLINE_MINUTE } from '@pins/appeals/constants/dates.js';

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getEditTimetable = async (request, response) => {
	renderEditTimetable(request, response);
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postEditTimetable = async (request, response) => {
	const { appealId } = request.params;
	const { errors, session } = request;
	if (errors) {
		return renderEditTimetable(request, response);
	}

	const appealDetails = request.currentAppeal;

	session.appealTimetable = {};

	const { appellantCase } = request.locals;

	const timeTableTypes = getAppealTimetableTypes(appealDetails, appellantCase);

	timeTableTypes.forEach((timetableType) => {
		const idText = getIdText(timetableType);
		const updatedDueDateDay = parseInt(request.body[`${idText}-due-date-day`], 10);
		const updatedDueDateMonth = parseInt(request.body[`${idText}-due-date-month`], 10);
		const updatedDueDateYear = parseInt(request.body[`${idText}-due-date-year`], 10);

		const updatedDueDateDayString = `0${updatedDueDateDay}`.slice(-2);
		const updatedDueDateMonthString = `0${updatedDueDateMonth}`.slice(-2);

		session.appealTimetable[timetableType] = dayMonthYearHourMinuteToISOString({
			year: updatedDueDateYear,
			month: updatedDueDateMonthString,
			day: updatedDueDateDayString
		});
	});

	return response.redirect(`/appeals-service/appeal-details/${appealId}/timetable/edit/check`);
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderEditTimetable = async (request, response) => {
	const { currentAppeal } = request;

	if (!currentAppeal) {
		return response.status(404).render('app/404.njk');
	}

	/** @type {import("@pins/express").ValidationErrors | undefined}*/
	const errors = request.errors;

	const appealId = currentAppeal.appealId;
	const appealTimetable = request.session.appealTimetable ?? currentAppeal.appealTimetable;
	const { appellantCase } = request.locals;

	const mappedPageContent = mapEditTimetablePage(
		appealTimetable,
		currentAppeal,
		appellantCase,
		request.body,
		errors
	);

	if (!appealId || !mappedPageContent) {
		return response.status(500).render('app/500.njk');
	}

	return response.status(200).render('appeals/appeal/update-date.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const renderCheckYourAnswers = async (request, response) => {
	const { errors, currentAppeal, session } = request;
	const baseUrl = request.baseUrl;

	if (!objectContainsAllKeys(session, 'appealTimetable')) {
		return response.status(500).render('app/500.njk');
	}

	const appealTimetables = session.appealTimetable;

	const { appellantCase } = request.locals;

	const timeTableTypes = getAppealTimetableTypes(currentAppeal, appellantCase);

	/** @type {{ [key: string]: {value?: string, actions?: { [text: string]: { href: string, visuallyHiddenText: string } }} }} */
	let responses = {};

	timeTableTypes.map((timetableType) => {
		const currentDueDateIso = appealTimetables && appealTimetables[timetableType];
		const currentDueDate = currentDueDateIso && dateISOStringToDisplayDate(currentDueDateIso);
		const idText = getTimetableTypeText(timetableType) + ' due';
		responses[idText] = {
			value: currentDueDate,
			actions: {
				Change: {
					href: `${baseUrl}/edit`,
					visuallyHiddenText: idText + ' date'
				}
			}
		};
	});

	return renderCheckYourAnswersComponent(
		{
			title: 'Check details and update timetable due dates',
			heading: 'Check details and update timetable due dates',
			preHeading: `Appeal ${currentAppeal.appealReference}`,
			backLinkUrl: `${baseUrl}/edit`,
			submitButtonText: 'Update timetable due dates',
			responses,
			after: [
				simpleHtmlComponent(
					'p',
					{ class: 'govuk-body' },
					'We’ll send an email to the appellant and LPA to tell them about the new timetable'
				)
			]
		},
		response,
		errors
	);
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postAppealTimetables = async (request, response) => {
	if (request.errors) {
		return renderEditTimetable(request, response);
	}

	const { session } = request;
	const appealDetails = request.currentAppeal;
	const appealId = appealDetails.appealId;
	const { appealTimetableId } = appealDetails.appealTimetable;

	let sessionTimetable = session.appealTimetable || {};
	const originalTimetable = appealDetails.appealTimetable || {};

	for (const key of Object.keys(sessionTimetable)) {
		const sessionDate = setTimeInTimeZone(
			sessionTimetable[key],
			DEADLINE_HOUR,
			DEADLINE_MINUTE
		).toISOString();
		if (sessionDate === originalTimetable[key]) {
			delete sessionTimetable[key];
		}
	}

	if (Object.keys(sessionTimetable).length === 0) {
		// no success banner since user made no changes
		delete session.appealTimetable;
		return response.redirect(`/appeals-service/appeal-details/${appealId}`);
	}

	try {
		const setAppealTimetableResponse = await setAppealTimetables(
			request.apiClient,
			appealId,
			appealTimetableId,
			{ ...sessionTimetable }
		);

		if (setAppealTimetableResponse.errors) {
			return response.status(500).render('app/500.njk');
		}

		addNotificationBannerToSession({
			session,
			bannerDefinitionKey: 'timetableDueDateUpdated',
			appealId
		});

		delete session.appealTimetable;
		return response.redirect(`/appeals-service/appeal-details/${appealId}`);
	} catch (error) {
		logger.error(
			error,
			error instanceof Error
				? error.message
				: 'Something went wrong when updating timetable due dates'
		);

		return response.status(500).render('app/500.njk');
	}
};
