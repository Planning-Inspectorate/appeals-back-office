import { appealSiteToAddressString } from '#lib/address-formatter.js';
import { generateNotifyPreview } from '#lib/api/notify-preview.api.js';
import { dateISOStringToDisplayDate } from '#lib/dates.js';
import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { getBackLinkUrlFromQuery } from '#lib/url-utilities.js';
import { addDays } from '@pins/appeals/utils/business-days.js';
import { formatTime } from '@pins/appeals/utils/date-formatter.js';
import { getTeamFromAppealId } from '../update-case-team/update-case-team.service.js';
import {
	cancelSiteVisitPage,
	scheduleOrManageSiteVisitConfirmationPage,
	siteVisitBookedPage,
	siteVisitMissedPage,
	siteVisitMissedPageCya,
	stringIsSiteVisitConfirmationPageType,
	typeOfSiteVisitPage
} from './site-visit.mapper.js';
import * as siteVisitService from './site-visit.service.js';

/** @typedef {import('../appeal-details.types.js').WebAppeal} Appeal


/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * @param {'schedule' | 'manage'} pageType
 */
const renderTypeOfSiteVisit = async (request, response, pageType) => {
	const { errors } = request;

	const appealDetails = request.currentAppeal;

	if (appealDetails) {
		let visitType = request.body['visit-type'] || '';

		request.session.visitType = visitType;
		request.session.readyToSetUp = request.session.readyToSetUp || false;
		const mappedPageContent = await typeOfSiteVisitPage(
			pageType,
			appealDetails,
			request.originalUrl,
			getBackLinkUrlFromQuery(request),
			request.session,
			request,
			visitType,
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

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const renderSiteVisitMissed = async (request, response) => {
	const appealDetails = request.currentAppeal;
	const { errors } = request;

	if (appealDetails) {
		const siteVisitIdAsNumber = appealDetails.siteVisit?.siteVisitId;

		if (typeof siteVisitIdAsNumber === 'number' && !Number.isNaN(siteVisitIdAsNumber)) {
			const pageContent = siteVisitMissedPage(
				request.params.appealId,
				appealDetails.appealReference,
				errors ? errors['whoMissedSiteVisitRadio'].msg : undefined
			);

			return response.status(200).render('patterns/display-page.pattern.njk', {
				pageContent,
				errors
			});
		}
	}

	return response.status(404).render('app/404.njk');
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const renderSiteVisitMissedCya = async (request, response) => {
	const appealDetails = request.currentAppeal;
	const { errors } = request;
	const { whoMissedSiteVisit } = request.session;
	if (appealDetails) {
		const siteVisitIdAsNumber = appealDetails.siteVisit?.siteVisitId;

		if (typeof siteVisitIdAsNumber === 'number' && !Number.isNaN(siteVisitIdAsNumber)) {
			const emailPreview = await getEmailPreview(
				appealDetails,
				whoMissedSiteVisit,
				request.apiClient
			);
			const pageContent = siteVisitMissedPageCya(
				request.currentAppeal,
				appealDetails.appealReference,
				whoMissedSiteVisit,
				emailPreview
			);

			return response.status(200).render('patterns/change-page.pattern.njk', {
				pageContent,
				errors
			});
		}
	}

	return response.status(404).render('app/404.njk');
};

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getTypeOfSiteVisit = async (request, response) => {
	renderTypeOfSiteVisit(request, response, 'schedule');
};

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getManageSiteVisit = async (request, response) => {
	renderTypeOfSiteVisit(request, response, 'manage');
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postTypeOfSiteVisit = async (request, response) => {
	if (request.errors) {
		return renderTypeOfSiteVisit(request, response, 'schedule');
	}
	request.session.visitType = request.body['visit-type'];
	return response.redirect(
		`/appeals-service/appeal-details/${request.currentAppeal.appealId}/site-visit/schedule`
	);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postSiteVisitMissed = async (request, response) => {
	if (request.errors) {
		return renderSiteVisitMissed(request, response);
	}

	request.session.whoMissedSiteVisit = request.body['whoMissedSiteVisitRadio'];

	return response.redirect(
		`/appeals-service/appeal-details/${request.currentAppeal.appealId}/site-visit/missed/check`
	);
};

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getSiteVisitScheduled = async (request, response) => {
	renderScheduleOrManageSiteVisitConfirmation(request, response);
};

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getSiteVisitBooked = async (request, response) => {
	renderSiteVisitBooked(request, response);
};

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getSiteVisitMissed = async (request, response) => {
	renderSiteVisitMissed(request, response);
};

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getCancelSiteVisit = async (request, response) => {
	renderCancelSiteVisit(request, response);
};

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getSiteVisitMissedCya = async (request, response) => {
	renderSiteVisitMissedCya(request, response);
};
/** @type {import('@pins/express').RequestHandler<Response>}  */
export const postSiteVisitMissedCya = async (request, response) => {
	const { errors } = request;
	const { whoMissedSiteVisit } = request.session;

	if (errors) {
		return renderSiteVisitMissedCya(request, response);
	}

	try {
		const appealDetails = request.currentAppeal;

		const missedSiteVisit = await siteVisitService.recordMissedSiteVisit(
			request.apiClient,
			appealDetails.appealId,
			appealDetails.siteVisit.siteVisitId,
			whoMissedSiteVisit
		);

		if (missedSiteVisit) {
			addNotificationBannerToSession({
				session: request.session,
				bannerDefinitionKey: 'missedSiteVisitRecorded',
				appealId: appealDetails.appealId
			});

			return response.redirect(`/appeals-service/appeal-details/${appealDetails.appealId}`);
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
 */
const renderCancelSiteVisit = async (request, response) => {
	const { errors } = request;

	const appealDetails = request.currentAppeal;
	const { email: assignedTeamEmail } = await getTeamFromAppealId(
		request.apiClient,
		appealDetails.appealId
	);

	const personalisation = {
		appeal_reference_number: appealDetails.appealReference,
		site_address: appealSiteToAddressString(appealDetails.appealSite),
		lpa_reference: appealDetails.planningApplicationReference,
		team_email_address: assignedTeamEmail
	};
	const templateName = 'site-visit-cancelled.content.md';
	const template = await generateNotifyPreview(request.apiClient, templateName, personalisation);

	if (appealDetails) {
		const mappedPageContent = await cancelSiteVisitPage(appealDetails, template.renderedHtml);

		return response.status(200).render('patterns/change-page.pattern.njk', {
			pageContent: mappedPageContent,
			errors
		});
	}
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postCancelSiteVisit = async (request, response) => {
	const { errors } = request;

	if (errors) {
		return renderCancelSiteVisit(request, response);
	}

	try {
		const appealDetails = request.currentAppeal;

		const cancelledSiteVisit = await siteVisitService.cancelSiteVisit(
			request.apiClient,
			appealDetails.appealId,
			appealDetails.siteVisit?.siteVisitId
		);

		if (cancelledSiteVisit) {
			addNotificationBannerToSession({
				session: request.session,
				bannerDefinitionKey: 'siteVisitCancelled',
				appealId: appealDetails.appealId
			});

			return response.redirect(`/appeals-service/appeal-details/${appealDetails.appealId}`);
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
 * @param {Appeal} appeal
 * @param {string} whoMissedSiteVisit
 * @param {import('got').Got} apiClient
 * @returns {Promise<{renderedHtml:string}>}
 * */
const getEmailPreview = async (appeal, whoMissedSiteVisit, apiClient) => {
	if (whoMissedSiteVisit === 'inspector') {
		return { renderedHtml: '' };
	}
	const templateName = `record-missed-site-visit-${whoMissedSiteVisit}.content.md`;
	const currentDate = new Date();
	const deadlineDate = dateISOStringToDisplayDate(await addDays(currentDate, 5));
	const personalisation = {
		appeal_reference_number: appeal.appealReference,
		site_address: appealSiteToAddressString(appeal.appealSite),
		lpa_reference: appeal.planningApplicationReference || '',
		visit_date: dateISOStringToDisplayDate(appeal.siteVisit.visitDate),
		'5_day_deadline': deadlineDate,
		start_time: formatTime(appeal.siteVisit.visitStartTime),
		team_email_address: (await getTeamFromAppealId(apiClient, appeal.appealId.toString())).email
	};

	const template = generateNotifyPreview(apiClient, templateName, personalisation);
	return template;
};
