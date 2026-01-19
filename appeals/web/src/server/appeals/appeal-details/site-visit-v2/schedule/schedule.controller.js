import usersService from '#appeals/appeal-users/users-service.js';
import { appealShortReference } from '#lib/appeals-formatter.js';
import {
	dateISOStringToDayMonthYearHourMinute,
	dayMonthYearHourMinuteToISOString
} from '#lib/dates.js';
import logger from '#lib/logger.js';
import { timeInput } from '#lib/mappers/components/page-components/time.js';
import { dateInput, yesNoInput } from '#lib/mappers/index.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { padNumberWithZero } from '#lib/string-utilities.js';
import { isBefore } from 'date-fns';
import { getSiteVisitSuccessBannerTypeAndChangeType } from '../site-visit.mapper.js';
import * as siteVisitService from '../site-visit.service.js';
import { siteVisitDateField } from '../site-visits.constants.js';
import {
	checkAndConfirmSiteVisitPage,
	mapPostScheduleOrManageSiteVisitCommonParameters as mapPostScheduleOrManageSiteVisitToUpdateOrCreateSiteVisitParameters,
	setPreviousVisitTypeIfChanged
} from './schedule.mapper.js';
/** @typedef {import('@pins/express').ValidationErrors} ValidationErrors */

//knowDateTime handlers
/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getKnowDateTime = async (request, response) => {
	renderKnowDateTimePage(request, response);
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postKnowDateTime = async (request, response) => {
	const { body, currentAppeal, session, errors } = request;
	if (errors) {
		return renderKnowDateTimePage(request, response);
	}
	session.dateTimeKnown = body['dateTimeRadio'];

	if (session.dateTimeKnown === 'no') {
		response.redirect(
			`/appeals-service/appeal-details/${currentAppeal.appealId}/site-visit/schedule/check-details`
		);
	} else {
		response.redirect(
			`/appeals-service/appeal-details/${currentAppeal.appealId}/site-visit/schedule/schedule-visit-date`
		);
	}
};

//schedule-visit-date handlers
/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getScheduleVisitDateTime = async (request, response) => {
	renderScheduleVisitDatePage(request, response);
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postScheduleVisitDateTime = async (request, response) => {
	const { errors, body, currentAppeal, session } = request;

	if (errors) {
		return renderScheduleVisitDatePage(request, response, errors);
	}
	const siteVisitDateFieldDay = body['visit-date-day'];
	const siteVisitDateFieldMonth = body['visit-date-month'];
	const siteVisitDateFieldYear = body['visit-date-year'];
	const siteVisitStartTimeHour = body['visit-start-time-hour'];
	const siteVisitStartTimeMinute = body['visit-start-time-minute'];
	const siteVisitEndTimeHour = body['visit-end-time-hour'] || '';
	const siteVisitEndTimeMinute = body['visit-end-time-minute'] || '';
	const siteVisitType = session.visitType || currentAppeal.siteVisit.visitType.toLowerCase();
	const readyToSetUp = session.readyToSetUp || false;
	const dateTimeKnown = session.dateTimeKnown || currentAppeal.siteVisit ? 'yes' : 'no';
	console.log(siteVisitType, 'siteVisitType', readyToSetUp, 'readyToSetUp');

	/** @type ValidationErrors */
	let errorMessage = {};
	try {
		const updatedValidDateDay = parseInt(siteVisitDateFieldDay, 10);
		const updatedValidDateMonth = parseInt(siteVisitDateFieldMonth, 10);
		const updatedValidDateYear = parseInt(siteVisitDateFieldYear, 10);

		if (
			Number.isNaN(updatedValidDateDay) ||
			Number.isNaN(updatedValidDateMonth) ||
			Number.isNaN(updatedValidDateYear)
		) {
			errorMessage['visit-date-day'] = {
				location: 'body',
				path: 'all-fields',
				value: '',
				type: 'field',
				msg: 'Enter the site visit date'
			};
		}

		const { createdAt } = currentAppeal;
		const validDateISOString = dayMonthYearHourMinuteToISOString({
			year: updatedValidDateYear,
			month: updatedValidDateMonth,
			day: updatedValidDateDay
		});

		const {
			day: createdAtDay,
			month: createdAtMonth,
			year: createdAtYear
		} = dateISOStringToDayMonthYearHourMinute(createdAt);
		const createdAtDateAtMidnight = dayMonthYearHourMinuteToISOString({
			day: createdAtDay,
			month: createdAtMonth,
			year: createdAtYear
		});

		console.log(
			validDateISOString,
			'validDateISOString',
			createdAtDateAtMidnight,
			'createdAtDateAtMidnight'
		);
		if (isBefore(new Date(validDateISOString), new Date(createdAtDateAtMidnight))) {
			errorMessage['visit-date-day'] = {
				location: 'body',
				path: 'all-fields',
				value: '',
				type: 'field',
				msg: 'The valid date must be on or after the date the case was received.'
			};
			if (siteVisitType === 'unaccompanied') {
				return renderScheduleVisitDatePage(request, response, errorMessage);
			}
		}

		if (siteVisitType === 'unaccompanied' && errorMessage['visit-date-day']) {
			return renderScheduleVisitDatePage(request, response, errorMessage);
		}

		if (
			(siteVisitType === 'accompanied' || siteVisitType === 'accessRequired') &&
			!readyToSetUp &&
			(!siteVisitStartTimeHour.length || !siteVisitStartTimeMinute.length)
		) {
			errorMessage['visit-start-time-hour'] = {
				location: 'body',
				path: 'all-fields',
				value: '',
				type: 'field',
				msg: 'Enter the start time'
			};
			return renderScheduleVisitDatePage(request, response, errorMessage);
		}
		if (siteVisitType === 'accessRequired' && readyToSetUp) {
			if (!siteVisitStartTimeHour.length || !siteVisitStartTimeMinute.length) {
				errorMessage['visit-start-time-hour'] = {
					location: 'body',
					path: 'all-fields',
					value: '',
					type: 'field',
					msg: 'Enter the start time'
				};
			}

			if (!siteVisitEndTimeHour.length || !siteVisitEndTimeMinute.length) {
				errorMessage['visit-end-time-hour'] = {
					location: 'body',
					path: 'all-fields',
					value: '',
					type: 'field',
					msg: 'Enter the end time'
				};
			}
			return renderScheduleVisitDatePage(request, response, errorMessage);
		}

		session.visitDateDay = siteVisitDateFieldDay;
		session.visitDateMonth = siteVisitDateFieldMonth;
		session.visitDateYear = siteVisitDateFieldYear;
		session.visitStartTimeHour = siteVisitStartTimeHour;
		session.visitStartTimeMinute = siteVisitStartTimeMinute;
		session.visitEndTimeHour = siteVisitEndTimeHour;
		session.visitEndTimeMinute = siteVisitEndTimeMinute;
		session.visitType = siteVisitType;
		session.readyToSetUp = readyToSetUp;
		session.dateTimeKnown = dateTimeKnown;
		response.redirect(
			`/appeals-service/appeal-details/${currentAppeal.appealId}/site-visit-v2/schedule/check-details`
		);
	} catch (error) {
		logger.error(
			error,
			error instanceof Error
				? error.message
				: 'Something went wrong when completing appellant case review'
		);

		return response.status(500).render('app/500.njk');
	}
};

//checkDetails handlers
/** @type {import('@pins/express').RequestHandler<Response>} */
export const getSiteVisitCheckDetails = async (request, response) => {
	return renderSiteVisitCheckDetails(request, response, undefined);
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postSiteVisitCheckDetails = async (request, response) => {
	const { errors, currentAppeal, session } = request;

	if (errors) {
		return renderSiteVisitCheckDetails(request, response);
	}
	const {
		params: { appealId }
	} = request;

	try {
		const appealDetails = currentAppeal;

		if (appealDetails) {
			let visitType = session.visitType || '';
			let visitDateDay = session.visitDateDay || '';
			let visitDateMonth = session.visitDateMonth || '';
			let visitDateYear = session.visitDateYear || '';
			let visitStartTimeHour = session.visitStartTimeHour || '';
			let visitStartTimeMinute = session.visitStartTimeMinute || '';
			let visitEndTimeHour = session.visitEndTimeHour || '';
			let visitEndTimeMinute = session.visitEndTimeMinute || '';

			const inspector =
				appealDetails.inspector &&
				(await usersService.getUserById(appealDetails.inspector, request.session));

			const mappedUpdateOrCreateSiteVisitParameters =
				mapPostScheduleOrManageSiteVisitToUpdateOrCreateSiteVisitParameters(
					appealId,
					visitDateDay || '',
					visitDateMonth || '',
					visitDateYear || '',
					visitStartTimeHour || '',
					visitStartTimeMinute || '',
					visitEndTimeHour || '',
					visitEndTimeMinute || '',
					visitType,
					inspector?.name || ''
				);

			setPreviousVisitTypeIfChanged(
				mappedUpdateOrCreateSiteVisitParameters,
				appealDetails.siteVisit?.visitType
			);

			if (appealDetails.siteVisit?.siteVisitId) {
				const successBannerAndChangeType = getSiteVisitSuccessBannerTypeAndChangeType(
					appealDetails,
					mappedUpdateOrCreateSiteVisitParameters
				);

				await siteVisitService.updateSiteVisit(
					request.apiClient,
					mappedUpdateOrCreateSiteVisitParameters.appealIdNumber,
					appealDetails.siteVisit?.siteVisitId,
					mappedUpdateOrCreateSiteVisitParameters.apiVisitType,
					mappedUpdateOrCreateSiteVisitParameters.visitDate,
					mappedUpdateOrCreateSiteVisitParameters.visitStartTime,
					mappedUpdateOrCreateSiteVisitParameters.visitEndTime,
					mappedUpdateOrCreateSiteVisitParameters.previousVisitType,
					mappedUpdateOrCreateSiteVisitParameters.inspectorName,
					successBannerAndChangeType.changeType
				);

				addNotificationBannerToSession({
					session: request.session,
					bannerDefinitionKey: 'siteVisitChangedDefault',
					appealId: appealDetails.appealId
				});

				return response.redirect(`/appeals-service/appeal-details/${appealDetails.appealId}`);
			} else {
				console.log('Creating new site visit', mappedUpdateOrCreateSiteVisitParameters);
				await siteVisitService.createSiteVisit(
					request.apiClient,
					mappedUpdateOrCreateSiteVisitParameters.appealIdNumber,
					mappedUpdateOrCreateSiteVisitParameters.apiVisitType,
					mappedUpdateOrCreateSiteVisitParameters.visitDate,
					mappedUpdateOrCreateSiteVisitParameters.visitStartTime,
					mappedUpdateOrCreateSiteVisitParameters.visitEndTime,
					mappedUpdateOrCreateSiteVisitParameters.inspectorName
				);

				addNotificationBannerToSession({
					session: request.session,
					bannerDefinitionKey: 'siteVisitScheduled',
					appealId: appealDetails.appealId
				});

				return response.redirect(`/appeals-service/appeal-details/${appealDetails.appealId}`);
			}
		}
		return response.status(404).render('app/404.njk');
	} catch (error) {
		logger.error(
			error,
			error instanceof Error ? error.message : 'Something went wrong when scheduling the site visit'
		);

		return response.status(500).render('app/500.njk');
	}
};

//Render functions

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * @param {import('@pins/express').ValidationErrors} [apiErrors]
 */
const renderKnowDateTimePage = async (request, response, apiErrors) => {
	const {
		currentAppeal: { appealReference }
	} = request;
	const shortAppealReference = appealShortReference(appealReference);

	let errors = request.errors || apiErrors;

	const pageContent = {
		title: `Do you know the date and time of the site visit?`,
		backLinkUrl: `/appeals-service/appeal-details/${request.currentAppeal.appealId}/appellant-case`,
		preHeading: `Appeal ${shortAppealReference}`,
		pageComponents: [
			yesNoInput({
				name: 'dateTimeRadio',
				legendText: 'Do you know the date and time of the site visit?',
				legendIsPageHeading: true
			})
		]
	};
	return response.status(200).render('patterns/change-page.pattern.njk', {
		pageContent: pageContent,
		errors
	});
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * @param {import('@pins/express').ValidationErrors} [apiErrors]
 */
const renderScheduleVisitDatePage = async (request, response, apiErrors) => {
	const {
		currentAppeal: { appealId, appealReference },
		session
	} = request;
	const appealDetails = request.currentAppeal;
	let shortAppealReference = appealShortReference(appealReference);
	const { day, month, year } = dateISOStringToDayMonthYearHourMinute(
		appealDetails.siteVisit?.visitDate
	);
	let { hour: startTimeHour, minute: startTimeMinute } = dateISOStringToDayMonthYearHourMinute(
		appealDetails.siteVisit?.visitStartTime
	);
	let { hour: endTimeHour, minute: endTimeMinute } = dateISOStringToDayMonthYearHourMinute(
		appealDetails.siteVisit?.visitEndTime
	);

	startTimeHour = startTimeHour !== undefined ? padNumberWithZero(startTimeHour) : undefined;
	startTimeMinute = startTimeMinute !== undefined ? padNumberWithZero(startTimeMinute) : undefined;
	endTimeHour = endTimeHour !== undefined ? padNumberWithZero(endTimeHour) : undefined;
	endTimeMinute = endTimeMinute !== undefined ? padNumberWithZero(endTimeMinute) : undefined;

	let dateTimeKnown = session.dateTimeKnown || appealDetails.siteVisit ? 'yes' : 'no';
	let visitType = session.visitType || appealDetails.siteVisit?.visitType;
	let readyToSetUp = session.readyToSetUp || false;
	let visitDateDay = appealDetails.siteVisit?.visitDate ? day : undefined;
	let visitDateMonth = appealDetails.siteVisit?.visitDate ? month : undefined;
	let visitDateYear = appealDetails.siteVisit?.visitDate ? year : undefined;
	let visitStartTimeHour = appealDetails.siteVisit?.visitStartTime ? startTimeHour : undefined;
	let visitStartTimeMinute = appealDetails.siteVisit?.visitStartTime ? startTimeMinute : undefined;
	let visitEndTimeHour = appealDetails.siteVisit?.visitEndTime ? endTimeHour : undefined;
	let visitEndTimeMinute = appealDetails.siteVisit?.visitEndTime ? endTimeMinute : undefined;
	let errors = request.errors || apiErrors;

	// /** @type {PageComponent} */
	const selectDateComponent = dateInput({
		name: siteVisitDateField,
		id: siteVisitDateField,
		namePrefix: siteVisitDateField,
		value: {
			day: visitDateDay,
			month: visitDateMonth,
			year: visitDateYear
		},
		legendText: 'Date',
		legendClasses: 'govuk-fieldset__legend--m',
		hint: 'For example, 31 3 2025',
		errors: errors
	});

	const selectStartTimeComponent = timeInput({
		id: 'visit-start-time',
		value: { hour: visitStartTimeHour, minute: visitStartTimeMinute },
		legendText: visitType === 'unaccompanied' ? 'Time (optional)' : 'Start time',
		legendClasses: 'govuk-fieldset__legend--m',
		showLabels: true,
		errorMessage: errors?.['visit-start-time-hour']?.msg,
		hint: 'For example, 9:00 or 13:15'
	});

	const selectEndTimeComponent = timeInput({
		id: 'visit-end-time',
		value: { hour: visitEndTimeHour, minute: visitEndTimeMinute },
		legendText: !(visitType === 'accessRequired' && readyToSetUp)
			? 'End time (optional)'
			: 'End time',
		legendClasses: 'govuk-fieldset__legend--m',
		fieldsetClasses: 'govuk-!-margin-bottom-6',
		showLabels: true,
		errorMessage: errors?.['visit-end-time-hour']?.msg,
		hint: 'For example, 9:00 or 13:15'
	});
	const backUrl =
		dateTimeKnown == 'yes'
			? `/appeals-service/appeal-details/${appealId}/site-visit-v2/schedule/know-date-time`
			: `/appeals-service/appeal-details/${appealId}/site-visit-v2/schedule/check-details`;
	/** @type {PageContent} */
	const pageContent = {
		heading: `Date and time`,
		title: `Date and time`,
		backLinkUrl: backUrl || `/appeals-service/appeal-details/${appealDetails.appealId}`,
		preHeading: `Appeal ${shortAppealReference} - set up site visit`,
		submitButtonText: 'Continue',
		pageComponents: [
			selectDateComponent,
			selectStartTimeComponent,
			...(visitType === 'accompanied' ||
			visitType === 'accessRequired' ||
			(visitType === 'accessRequired' && readyToSetUp)
				? [selectEndTimeComponent]
				: [])
		]
	};

	return response.status(200).render('patterns/change-page.pattern.njk', {
		pageContent: pageContent,
		errors
	});
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * @param {import('@pins/express').ValidationErrors} [apiErrors]
 */
const renderSiteVisitCheckDetails = async (request, response, apiErrors) => {
	const mappedPageContent = checkAndConfirmSiteVisitPage(request);
	return response.status(200).render('patterns/change-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors: request.errors || apiErrors
	});
};
