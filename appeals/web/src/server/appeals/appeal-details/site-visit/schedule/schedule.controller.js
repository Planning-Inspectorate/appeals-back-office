import usersService from '#appeals/appeal-users/users-service.js';
import { appealShortReference } from '#lib/appeals-formatter.js';

import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { getBackLinkUrlFromQuery } from '#lib/url-utilities.js';
import { getSiteVisitSuccessBannerTypeAndChangeType } from '../site-visit.mapper.js';
import * as siteVisitService from '../site-visit.service.js';
import {
	checkAndConfirmSiteVisitPage,
	knowDateTimePage,
	mapPostScheduleOrManageSiteVisitCommonParameters as mapPostScheduleOrManageSiteVisitToUpdateOrCreateSiteVisitParameters,
	scheduleVisitDateTimePage,
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
		session.visitDateDay = null;
		session.visitDateMonth = null;
		session.visitDateYear = null;
		session.visitStartTimeHour = null;
		session.visitStartTimeMinute = null;
		session.visitEndTimeHour = null;
		session.visitEndTimeMinute = null;
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
			`/appeals-service/appeal-details/${currentAppeal.appealId}/site-visit/schedule/check-details`
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
			let knowDateTime = session.dateTimeKnown || (appealDetails.siteVisit ? 'yes' : 'no');
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
				await siteVisitService.createSiteVisit(
					request.apiClient,
					mappedUpdateOrCreateSiteVisitParameters.appealIdNumber,
					mappedUpdateOrCreateSiteVisitParameters.apiVisitType,
					mappedUpdateOrCreateSiteVisitParameters.visitDate,
					mappedUpdateOrCreateSiteVisitParameters.visitStartTime,
					mappedUpdateOrCreateSiteVisitParameters.visitEndTime,
					mappedUpdateOrCreateSiteVisitParameters.inspectorName,
					knowDateTime
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
	if (shortAppealReference) {
		return response.status(200).render('patterns/change-page.pattern.njk', {
			pageContent: knowDateTimePage(
				request.currentAppeal,
				shortAppealReference,
				errors,
				request.session,
				getBackLinkUrlFromQuery(request)
			),
			errors
		});
	}
	return response.status(404).render('app/404.njk');
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * @param {import('@pins/express').ValidationErrors} [apiErrors]
 */
const renderScheduleVisitDatePage = async (request, response, apiErrors) => {
	const { session, currentAppeal } = request;
	const errors = request.errors || apiErrors;
	return response.status(200).render('patterns/change-page.pattern.njk', {
		pageContent: scheduleVisitDateTimePage(
			currentAppeal,
			currentAppeal.appealReference,
			errors,
			session,
			getBackLinkUrlFromQuery(request)
		),
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
