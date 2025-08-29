import usersService from '#appeals/appeal-users/users-service.js';
import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { getBackLinkUrlFromQuery } from '#lib/url-utilities.js';
import {
	getSiteVisitSuccessBannerTypeAndChangeType,
	mapPostScheduleOrManageSiteVisitCommonParameters as mapPostScheduleOrManageSiteVisitToUpdateOrCreateSiteVisitParameters,
	scheduleOrManageSiteVisitConfirmationPage,
	scheduleOrManageSiteVisitPage,
	setPreviousVisitTypeIfChanged,
	siteVisitBookedPage,
	stringIsSiteVisitConfirmationPageType
} from './site-visit.mapper.js';
import * as siteVisitService from './site-visit.service.js';

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * @param {'schedule' | 'manage'} pageType
 */
const renderScheduleOrManageSiteVisit = async (request, response, pageType) => {
	const { errors } = request;

	const appealDetails = request.currentAppeal;

	if (appealDetails) {
		let {
			body: {
				'visit-type': visitType,
				'visit-date-day': visitDateDay,
				'visit-date-month': visitDateMonth,
				'visit-date-year': visitDateYear,
				'visit-start-time-hour': visitStartTimeHour,
				'visit-start-time-minute': visitStartTimeMinute,
				'visit-end-time-hour': visitEndTimeHour,
				'visit-end-time-minute': visitEndTimeMinute
			}
		} = request;

		const mappedPageContent = await scheduleOrManageSiteVisitPage(
			pageType,
			appealDetails,
			request.originalUrl,
			getBackLinkUrlFromQuery(request),
			request.session,
			request,
			visitType,
			visitDateDay,
			visitDateMonth,
			visitDateYear,
			visitStartTimeHour,
			visitStartTimeMinute,
			visitEndTimeHour,
			visitEndTimeMinute,
			errors
		);

		return response.status(200).render('patterns/change-page.pattern.njk', {
			pageContent: mappedPageContent,
			errors
		});
	}

	return response.status(404).render('app/404.njk');
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const renderScheduleOrManageSiteVisitConfirmation = async (request, response) => {
	const {
		params: { appealId, confirmationPageTypeToRender }
	} = request;

	const appealDetails = request.currentAppeal;

	if (appealDetails) {
		const siteVisitIdAsNumber = appealDetails.siteVisit?.siteVisitId;
		if (typeof siteVisitIdAsNumber === 'number' && !Number.isNaN(siteVisitIdAsNumber)) {
			const appealIdNumber = parseInt(appealId, 10);
			const siteVisit = await siteVisitService.getSiteVisit(
				request.apiClient,
				appealIdNumber,
				siteVisitIdAsNumber
			);

			if (siteVisit && stringIsSiteVisitConfirmationPageType(confirmationPageTypeToRender)) {
				const pageContent = scheduleOrManageSiteVisitConfirmationPage(
					confirmationPageTypeToRender,
					appealDetails
				);

				return response.status(200).render('appeals/confirmation.njk', {
					pageContent
				});
			}
		}
	}

	return response.status(404).render('app/404.njk');
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const renderSiteVisitBooked = async (request, response) => {
	const appealDetails = request.currentAppeal;

	if (appealDetails) {
		const siteVisitIdAsNumber = appealDetails.siteVisit?.siteVisitId;

		if (typeof siteVisitIdAsNumber === 'number' && !Number.isNaN(siteVisitIdAsNumber)) {
			const pageContent = siteVisitBookedPage(
				request.params.appealId,
				appealDetails.appealReference
			);

			return response.status(200).render('patterns/display-page.pattern.njk', {
				pageContent
			});
		}
	}

	return response.status(404).render('app/404.njk');
};

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getScheduleSiteVisit = async (request, response) => {
	renderScheduleOrManageSiteVisit(request, response, 'schedule'); // TODO: refactor to boolean for consistency with renderAssignUser isInspector param
};

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getManageSiteVisit = async (request, response) => {
	renderScheduleOrManageSiteVisit(request, response, 'manage');
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postScheduleSiteVisit = async (request, response) => {
	postScheduleOrManageSiteVisit(request, response, 'schedule');
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postManageSiteVisit = async (request, response) => {
	postScheduleOrManageSiteVisit(request, response, 'manage');
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * @param {'schedule' | 'manage'} pageType
 */
export const postScheduleOrManageSiteVisit = async (request, response, pageType) => {
	const { errors } = request;

	if (errors) {
		return renderScheduleOrManageSiteVisit(request, response, pageType);
	}

	const {
		params: { appealId }
	} = request;

	try {
		const appealDetails = request.currentAppeal;

		if (appealDetails) {
			const {
				body: {
					/** @type {WebSiteVisitType} */
					'visit-type': visitType,
					'visit-date-day': visitDateDay,
					'visit-date-month': visitDateMonth,
					'visit-date-year': visitDateYear,
					'visit-start-time-hour': visitStartTimeHour,
					'visit-start-time-minute': visitStartTimeMinute,
					'visit-end-time-hour': visitEndTimeHour,
					'visit-end-time-minute': visitEndTimeMinute
				}
			} = request;

			const inspector =
				appealDetails.inspector &&
				(await usersService.getUserById(appealDetails.inspector, request.session));

			const mappedUpdateOrCreateSiteVisitParameters =
				mapPostScheduleOrManageSiteVisitToUpdateOrCreateSiteVisitParameters(
					appealId,
					visitDateDay,
					visitDateMonth,
					visitDateYear,
					visitStartTimeHour,
					visitStartTimeMinute,
					visitEndTimeHour,
					visitEndTimeMinute,
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

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getSiteVisitScheduled = async (request, response) => {
	renderScheduleOrManageSiteVisitConfirmation(request, response);
};

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getSiteVisitBooked = async (request, response) => {
	renderSiteVisitBooked(request, response);
};
