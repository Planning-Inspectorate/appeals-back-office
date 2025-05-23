import logger from '#lib/logger.js';
import { objectContainsAllKeys } from '#lib/object-utilities.js';
import { setAppealTimetables } from './timetable.service.js';
import { mapEditTimetablePage, getAppealTimetableTypes, getIdText } from './timetable.mapper.js';
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

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postEditTimetable = async (request, response) => {
	const { appealId } = request.params;
	const { errors, session } = request;
	if (errors) {
		return renderEditTimetable(request, response);
	}

	const appealDetails = request.currentAppeal;

	session.appealTimetable = {};

	const timeTableTypes = getAppealTimetableTypes(appealDetails.appealType);

	timeTableTypes.forEach((timetableType) => {
		const idText = getIdText(timetableType);
		const updatedDueDateDay = parseInt(request.body[`${idText}-due-date-day`], 10);
		const updatedDueDateMonth = parseInt(request.body[`${idText}-due-date-month`], 10);
		const updatedDueDateYear = parseInt(request.body[`${idText}-due-date-year`], 10);

		if (
			!objectContainsAllKeys(request.body, [
				`${idText}-due-date-day`,
				`${idText}-due-date-month`,
				`${idText}-due-date-year`
			]) ||
			Number.isNaN(updatedDueDateDay) ||
			Number.isNaN(updatedDueDateMonth) ||
			Number.isNaN(updatedDueDateYear)
		) {
			return response.status(500).render('app/500.njk');
		}

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

	const mappedPageContent = mapEditTimetablePage(appealTimetable, currentAppeal, errors);

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
export const renderCheckYourAnswers = (request, response) => {
	const { errors, currentAppeal, session } = request;
	const baseUrl = request.baseUrl;

	if (!objectContainsAllKeys(session, 'appealTimetable')) {
		return response.status(500).render('app/500.njk');
	}
	const appealTimetable = session.appealTimetable;
	const currentDueDateIso = appealTimetable && appealTimetable['lpaQuestionnaireDueDate'];
	const currentDueDate = currentDueDateIso && dateISOStringToDisplayDate(currentDueDateIso);

	return renderCheckYourAnswersComponent(
		{
			title: 'Check details and update timetable due dates',
			heading: 'Check details and update timetable due dates',
			preHeading: `Appeal ${currentAppeal.appealReference}`,
			backLinkUrl: `${baseUrl}/edit`,
			submitButtonText: 'Update timetable due dates',
			responses: {
				'LPA questionnaire due': {
					value: currentDueDate,
					actions: {
						Change: {
							href: `${baseUrl}/edit`,
							visuallyHiddenText: 'supporting document'
						}
					}
				}
			},
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

	const sessionTimetable = session.appealTimetable || {};
	const originalTimetable = appealDetails.appealTimetable || {};

	//need to set time in timezone with deadline etc
	const isUnchanged = Object.keys(sessionTimetable).every(
		(key) =>
			setTimeInTimeZone(sessionTimetable[key], DEADLINE_HOUR, DEADLINE_MINUTE).toISOString() ===
			originalTimetable[key]
	);

	if (isUnchanged) {
		addNotificationBannerToSession({
			session,
			bannerDefinitionKey: 'timetableDueDateUpdated',
			appealId
		});
		return response.redirect(`/appeals-service/appeal-details/${appealId}`);
	}

	try {
		const setAppealTimetableResponse = await setAppealTimetables(
			request.apiClient,
			appealId,
			appealTimetableId,
			{ ...session.appealTimetable }
		);

		if (setAppealTimetableResponse.errors) {
			return response.status(500).render('app/500.njk');
		}

		addNotificationBannerToSession({
			session,
			bannerDefinitionKey: 'timetableDueDateUpdated',
			appealId
		});

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
