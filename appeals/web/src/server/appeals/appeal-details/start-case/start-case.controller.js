import featureFlags from '#common/feature-flags.js';
import { getEnabledHearingAppealTypes } from '#common/hearing-appeal-types.js';
import { getEnabledInquiryAppealTypes } from '#common/inquiry-appeal-types.js';
import { dateISOStringToDisplayDate, getTodaysISOString } from '#lib/dates.js';
import {
	applyEditsForAppeal,
	clearEditsForAppeal,
	getSessionValuesForAppeal
} from '#lib/edit-utilities.js';
import logger from '#lib/logger.js';
import { backLinkGenerator } from '#lib/middleware/save-back-url.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import {
	addBackLinkQueryToUrl,
	getBackLinkUrlFromQuery,
	preserveQueryString
} from '#lib/url-utilities.js';
import { APPEAL_TYPE, FEATURE_FLAG_NAMES } from '@pins/appeals/constants/common.js';
import { recalculateDateIfNotBusinessDay } from '@pins/appeals/utils/business-days.js';
import { APPEAL_CASE_PROCEDURE } from '@planning-inspectorate/data-model';
import {
	changeDatePage,
	confirmProcedurePage,
	selectProcedurePage,
	startCasePage
} from './start-case.mapper.js';
import * as startCaseService from './start-case.service.js';
import { getStartCaseNotifyPreviews } from './start-case.service.js';

const getBackLinkUrl = backLinkGenerator('startCase');

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getStartDate = async (request, response) => {
	const {
		currentAppeal: { appealId, appealType },
		session
	} = request;

	if (session.startCaseAppealProcedure?.[appealId]) {
		delete session.startCaseAppealProcedure?.[appealId];
	}

	const hearingOrInquiryEnabled =
		getEnabledHearingAppealTypes().includes(appealType) ||
		getEnabledInquiryAppealTypes().includes(appealType);

	if (
		// S78 and enforcement and ELB should always go to select procedure, other appeal types should only go to select procedure if hearing or inquiry is enabled for that appeal type
		[
			APPEAL_TYPE.S78,
			APPEAL_TYPE.ENFORCEMENT_NOTICE,
			APPEAL_TYPE.ENFORCEMENT_LISTED_BUILDING
		].includes(appealType) ||
		hearingOrInquiryEnabled
	) {
		return response.redirect(
			`/appeals-service/appeal-details/${appealId}/start-case/select-procedure${
				request.query?.backUrl ? `?backUrl=${request.query?.backUrl}` : ''
			}`
		);
	}

	renderStartDatePage(request, response);
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderStartDatePage = async (request, response) => {
	const { appealId, appealReference, startedAt } = request.currentAppeal;

	if (startedAt) {
		return response.status(500).render('app/500.njk');
	}

	const mappedPageContent = startCasePage(
		appealId,
		appealReference,
		dateISOStringToDisplayDate(getTodaysISOString()),
		getBackLinkUrlFromQuery(request)
	);

	return response.status(200).render('patterns/display-page.pattern.njk', {
		pageContent: mappedPageContent
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postStartDate = async (request, response) => {
	try {
		const { appealId } = request.currentAppeal;

		await startCaseService.setStartDate(request.apiClient, appealId, getTodaysISOString());

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'caseStarted',
			appealId
		});

		return response.redirect(`/appeals-service/appeal-details/${appealId}`);
	} catch (error) {
		logger.error(
			error,
			error instanceof Error
				? error.message
				: 'Something went wrong when posting the case start date'
		);

		return response.status(500).render('app/500.njk');
	}
};

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getChangeDate = async (request, response) => {
	renderChangeDatePage(request, response);
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderChangeDatePage = async (request, response) => {
	const { appealId, appealReference, startedAt, documentationSummary } = request.currentAppeal;

	if (!startedAt || documentationSummary?.lpaQuestionnaire?.status !== 'not_received') {
		return response.render('app/500.njk');
	}

	const nextBusinessDayFromToday = await recalculateDateIfNotBusinessDay(getTodaysISOString());

	const mappedPageContent = changeDatePage(
		appealId,
		appealReference,
		dateISOStringToDisplayDate(nextBusinessDayFromToday)
	);

	return response.render('patterns/display-page.pattern.njk', {
		pageContent: mappedPageContent
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postChangeDate = async (request, response) => {
	try {
		const { appealId, documentationSummary } = request.currentAppeal;

		if (documentationSummary?.lpaQuestionnaire?.status !== 'not_received') {
			return response.render('app/500.njk');
		}

		await startCaseService.setStartDate(request.apiClient, appealId, getTodaysISOString());

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'startDateChanged',
			appealId
		});

		return response.redirect(`/appeals-service/appeal-details/${appealId}`);
	} catch (error) {
		logger.error(
			error,
			error instanceof Error
				? error.message
				: 'Something went wrong when posting the case start date'
		);

		return response.render('app/500.njk');
	}
};

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getSelectProcedure = async (request, response) => {
	const {
		currentAppeal: { appealType, appealId },
		session
	} = request;

	const hearingOrInquiryEnabled =
		getEnabledHearingAppealTypes().includes(appealType) ||
		getEnabledInquiryAppealTypes().includes(appealType);

	const isEnforcementType = [
		APPEAL_TYPE.ENFORCEMENT_NOTICE,
		APPEAL_TYPE.ENFORCEMENT_LISTED_BUILDING
	].includes(appealType);

	// enforcement should redirect to check your answers if hearing or inquiry is not enabled, as there is only one procedure option available
	if (
		isEnforcementType &&
		featureFlags.isFeatureActive(FEATURE_FLAG_NAMES.ENFORCEMENT_NOTICE) &&
		!hearingOrInquiryEnabled
	) {
		session.startCaseAppealProcedure = {
			[appealId]: { appealProcedure: APPEAL_CASE_PROCEDURE.WRITTEN }
		};

		return response.redirect(preserveQueryString(request, redirectionTarget(request)));
	}
	return renderSelectProcedure(request, response);
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderSelectProcedure = async (request, response) => {
	const {
		currentAppeal: { appealId, appealReference, appealType },
		errors
	} = request;

	const sessionValues = getSessionValuesForAppeal(request, 'startCaseAppealProcedure', appealId);

	const backUrl = getBackLinkUrl(
		request,
		null,
		`/appeals-service/appeal-details/${appealId}/start-case/select-procedure/check-and-confirm`
	);

	const mappedPageContent = selectProcedurePage(
		appealReference,
		appealType,
		backUrl,
		{ appealProcedure: sessionValues?.appealProcedure },
		errors ? errors['appealProcedure']?.msg : undefined
	);

	return response.render('patterns/change-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postSelectProcedure = async (request, response) => {
	try {
		const {
			currentAppeal: { appealId },
			errors
		} = request;

		if (errors) {
			return renderSelectProcedure(request, response);
		}

		const sessionValues = getSessionValuesForAppeal(request, 'startCaseAppealProcedure', appealId);

		if (!sessionValues?.appealProcedure) {
			logger.error('No appeal procedure found in session');
			return response.status(500).render('app/500.njk');
		}

		return response.redirect(preserveQueryString(request, redirectionTarget(request)));
	} catch (error) {
		logger.error(
			error,
			error instanceof Error
				? error.message
				: 'Something went wrong when posting the select appeal procedure page'
		);

		return response.status(500).render('app/500.njk');
	}
};

/**
 * @param {import('@pins/express').Request} request
 */
const useNewHearingRoute = (request) => {
	const featureFlagOverrideForTests =
		process.env.NODE_ENV === 'test' && request.headers['x-feature-flag-hearing-post-mvp'];

	if (featureFlagOverrideForTests) {
		return featureFlagOverrideForTests === 'true';
	}

	return featureFlags.isFeatureActive(FEATURE_FLAG_NAMES.HEARING_POST_MVP);
};

/**
 * @param {import('@pins/express').Request} request
 */
const redirectionTarget = (request) => {
	const {
		currentAppeal: { appealId }
	} = request;

	const sessionValues = getSessionValuesForAppeal(request, 'startCaseAppealProcedure', appealId);

	if (sessionValues?.appealProcedure === APPEAL_CASE_PROCEDURE.INQUIRY) {
		return addBackLinkQueryToUrl(
			request,
			`/appeals-service/appeal-details/${appealId}/inquiry/setup/date`
		);
	}

	if (
		sessionValues?.appealProcedure === APPEAL_CASE_PROCEDURE.HEARING &&
		useNewHearingRoute(request)
	) {
		return `/appeals-service/appeal-details/${appealId}/start-case/hearing`;
	}

	applyEditsForAppeal(request, 'startCaseAppealProcedure', appealId);

	return `/appeals-service/appeal-details/${appealId}/start-case/select-procedure/check-and-confirm`;
};

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getConfirmProcedure = async (request, response) => {
	return renderConfirmProcedure(request, response);
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderConfirmProcedure = async (request, response) => {
	const {
		currentAppeal: { appealId, appealReference, appealType },
		errors
	} = request;

	const sessionValues = getSessionValuesForAppeal(request, 'startCaseAppealProcedure', appealId);

	if (!sessionValues?.appealProcedure) {
		return response.status(500).render('app/500.njk');
	}

	clearEditsForAppeal(request, 'startCaseAppealProcedure', appealId);

	const showEmailPreviews =
		appealType === APPEAL_TYPE.ENFORCEMENT_NOTICE ||
		appealType === APPEAL_TYPE.ENFORCEMENT_LISTED_BUILDING;

	/** @type {{appellant: string, lpa: string} | undefined} */
	let emailPreviews;

	if (showEmailPreviews) {
		const errorMessage = 'Failed to generate email preview';
		try {
			const result = await getStartCaseNotifyPreviews(
				request.apiClient,
				appealId,
				undefined,
				sessionValues?.appealProcedure
			);
			emailPreviews = {
				appellant: result.appellant || errorMessage,
				lpa: result.lpa || errorMessage
			};
		} catch (error) {
			logger.error(error);
		}
	}

	const mappedPageContent = confirmProcedurePage(
		appealId,
		appealReference,
		sessionValues?.appealProcedure,
		appealType,
		emailPreviews
	);

	return response.render('patterns/change-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postConfirmProcedure = async (request, response) => {
	try {
		const {
			currentAppeal: { appealId }
		} = request;

		const sessionValues = getSessionValuesForAppeal(request, 'startCaseAppealProcedure', appealId);

		if (!sessionValues?.appealProcedure) {
			return response.status(500).render('app/500.njk');
		}

		await startCaseService.setStartDate(
			request.apiClient,
			appealId,
			getTodaysISOString(),
			sessionValues?.appealProcedure
		);

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'caseStarted',
			appealId
		});

		if (sessionValues?.appealProcedure === APPEAL_CASE_PROCEDURE.HEARING) {
			addNotificationBannerToSession({
				session: request.session,
				bannerDefinitionKey: 'timetableStarted',
				appealId
			});
		}

		return response.redirect(`/appeals-service/appeal-details/${appealId}`);
	} catch (error) {
		logger.error(
			error,
			error instanceof Error
				? error.message
				: 'Something went wrong when posting the check details and start case page'
		);

		return response.status(500).render('app/500.njk');
	}
};
