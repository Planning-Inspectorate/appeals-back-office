import { dateISOStringToDisplayDate } from '#lib/dates.js';
import logger from '#lib/logger.js';
import {
	startCasePage,
	changeDatePage,
	selectProcedurePage,
	confirmProcedurePage
} from './start-case.mapper.js';
import * as startCaseService from './start-case.service.js';
import { getTodaysISOString } from '#lib/dates.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import featureFlags from '#common/feature-flags.js';
import { FEATURE_FLAG_NAMES, APPEAL_TYPE } from '@pins/appeals/constants/common.js';
import { getBackLinkUrlFromQuery } from '#lib/url-utilities.js';
import { APPEAL_CASE_PROCEDURE } from '@planning-inspectorate/data-model';

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getStartDate = async (request, response) => {
	const {
		currentAppeal: { appealId, appealType },
		session
	} = request;

	if (session.startCaseAppealProcedure?.[appealId]) {
		delete session.startCaseAppealProcedure?.[appealId];
	}

	if (
		appealType === APPEAL_TYPE.S78 &&
		(featureFlags.isFeatureActive(FEATURE_FLAG_NAMES.SECTION_78_HEARING) ||
			featureFlags.isFeatureActive(FEATURE_FLAG_NAMES.SECTION_78_INQUIRY))
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
	const mappedPageContent = changeDatePage(
		appealId,
		appealReference,
		dateISOStringToDisplayDate(getTodaysISOString())
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
	renderSelectProcedure(request, response);
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderSelectProcedure = async (request, response) => {
	const {
		currentAppeal: { appealId, appealReference },
		session,
		errors
	} = request;

	const mappedPageContent = selectProcedurePage(
		appealReference,
		request.query?.backUrl ? String(request.query?.backUrl) : '/',
		session.startCaseAppealProcedure?.[appealId]
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

		const { session } = request;

		if (!session.startCaseAppealProcedure?.[appealId]?.appealProcedure) {
			return response.status(500).render('app/500.njk');
		}

		if (
			session.startCaseAppealProcedure?.[appealId]?.appealProcedure ===
			APPEAL_CASE_PROCEDURE.INQUIRY
		) {
			return response.redirect(`/appeals-service/appeal-details/${appealId}/inquiry/setup/date`);
		}

		return response.redirect(
			`/appeals-service/appeal-details/${appealId}/start-case/select-procedure/check-and-confirm`
		);
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

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getConfirmProcedure = async (request, response) => {
	renderConfirmProcedure(request, response);
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderConfirmProcedure = async (request, response) => {
	const {
		currentAppeal: { appealId, appealReference },
		session,
		errors
	} = request;

	if (!session.startCaseAppealProcedure?.[appealId]?.appealProcedure) {
		return response.status(500).render('app/500.njk');
	}

	const mappedPageContent = confirmProcedurePage(
		appealId,
		appealReference,
		session.startCaseAppealProcedure?.[appealId]?.appealProcedure
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

		const { session } = request;

		if (!session.startCaseAppealProcedure?.[appealId]?.appealProcedure) {
			return response.status(500).render('app/500.njk');
		}

		await startCaseService.setStartDate(
			request.apiClient,
			appealId,
			getTodaysISOString(),
			session.startCaseAppealProcedure?.[appealId]?.appealProcedure
		);

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'caseStarted',
			appealId
		});

		if (
			session.startCaseAppealProcedure?.[appealId]?.appealProcedure ===
			APPEAL_CASE_PROCEDURE.HEARING
		) {
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
