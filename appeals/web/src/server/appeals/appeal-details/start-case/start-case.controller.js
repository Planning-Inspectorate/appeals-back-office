import featureFlags from '#common/feature-flags.js';
import { getEnabledHearingAppealTypes } from '#common/hearing-appeal-types.js';
import { getEnabledInquiryAppealTypes } from '#common/inquiry-appeal-types.js';
import {
	dateISOStringToDisplayDate,
	dayMonthYearHourMinuteToISOString,
	getTodaysISOString
} from '#lib/dates.js';
import {
	applyEditsForAppeal,
	clearEditsForAppeal,
	getSessionValuesForAppeal
} from '#lib/edit-utilities.js';
import logger from '#lib/logger.js';
import isLinkedAppeal from '#lib/mappers/utils/is-linked-appeal.js';
import { backLinkGenerator } from '#lib/middleware/save-back-url.js';
import { getInspectorFormattedEmailName } from '#lib/service-user-formatter.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import {
	addBackLinkQueryToUrl,
	getBackLinkUrlFromQuery,
	preserveQueryString
} from '#lib/url-utilities.js';
import { APPEAL_TYPE, FEATURE_FLAG_NAMES } from '@pins/appeals/constants/common.js';
import {
	isAnyEnforcementAppealType,
	isGenericAppealType
} from '@pins/appeals/utils/appeal-type-checks.js';
import { recalculateDateIfNotBusinessDay } from '@pins/appeals/utils/business-days.js';
import { APPEAL_CASE_PROCEDURE } from '@planning-inspectorate/data-model';
import { getAppellantCaseFromAppealId } from '../appellant-case/appellant-case.service.js';
import { getIdText, mapEditTimetablePage } from '../timetable/timetable.mapper.js';
import { buildSessionDate } from '../timetable/timetable.validators.js';
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
		// S78 and enforcement, ELB and generic apppeals should always go to select procedure, other appeal types should only go to select procedure if hearing or inquiry is enabled for that appeal type
		[
			APPEAL_TYPE.S78,
			APPEAL_TYPE.ENFORCEMENT_NOTICE,
			APPEAL_TYPE.ENFORCEMENT_LISTED_BUILDING
		].includes(appealType) ||
		hearingOrInquiryEnabled ||
		isGenericAppealType(appealType)
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

	const isLinked = isLinkedAppeal(request.currentAppeal);

	const hearingOrInquiryEnabled =
		getEnabledHearingAppealTypes(isLinked).includes(appealType) ||
		getEnabledInquiryAppealTypes(isLinked).includes(appealType);

	// enforcement should redirect to check your answers if hearing or inquiry is not enabled, as there is only one procedure option available
	if (isAnyEnforcementAppealType(appealType) && !hearingOrInquiryEnabled) {
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
		currentAppeal: { appealId, appealReference, appealType, appellantCaseId },
		errors
	} = request;
	const appellantCase = featureFlags.isFeatureActive(FEATURE_FLAG_NAMES.EXPEDITED_APPEALS_LPAQ)
		? await getAppellantCaseFromAppealId(request.apiClient, appealId, appellantCaseId)
		: undefined;

	const sessionValues = getSessionValuesForAppeal(request, 'startCaseAppealProcedure', appealId);
	const isLinked = isLinkedAppeal(request.currentAppeal);

	const backUrl = getBackLinkUrl(
		request,
		null,
		`/appeals-service/appeal-details/${appealId}/start-case/select-procedure/check-and-confirm`
	);

	const mappedPageContent = selectProcedurePage(
		appealReference,
		appealType,
		isLinked,
		backUrl,
		{ appealProcedure: sessionValues?.appealProcedure },
		appellantCase,
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
		currentAppeal: { appealId, appealType }
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

	if (isGenericAppealType(appealType)) {
		return `/appeals-service/appeal-details/${appealId}/start-case/timetable`;
	}

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
		currentAppeal: { appealId, appealReference, appealType, inspector },
		errors
	} = request;

	const sessionValues = getSessionValuesForAppeal(request, 'startCaseAppealProcedure', appealId);

	if (!sessionValues?.appealProcedure) {
		return response.status(500).render('app/500.njk');
	}

	clearEditsForAppeal(request, 'startCaseAppealProcedure', appealId);

	const showEmailPreviews = isAnyEnforcementAppealType(appealType);

	/** @type {{appellant: string, lpa: string} | undefined} */
	let emailPreviews;

	const inspectorName = await getInspectorFormattedEmailName(inspector, request);

	if (showEmailPreviews) {
		const errorMessage = 'Failed to generate email preview';
		try {
			const result = await getStartCaseNotifyPreviews(
				request.apiClient,
				appealId,
				undefined,
				sessionValues?.appealProcedure,
				null,
				null,
				null,
				inspectorName
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
			currentAppeal: { appealId, inspector }
		} = request;

		const sessionValues = getSessionValuesForAppeal(request, 'startCaseAppealProcedure', appealId);

		if (!sessionValues?.appealProcedure) {
			return response.status(500).render('app/500.njk');
		}

		const isGeneric = isGenericAppealType(request.currentAppeal.appealType);

		const hearingEstimatedDays =
			sessionValues?.hearingEstimationYesNo === 'yes' ? sessionValues?.hearingEstimationDays : null;

		const hearingStartTime =
			sessionValues?.dateKnown === 'yes' &&
			sessionValues['hearing-date-day'] &&
			sessionValues['hearing-date-month'] &&
			sessionValues['hearing-date-year']
				? dayMonthYearHourMinuteToISOString({
						day: sessionValues['hearing-date-day'],
						month: sessionValues['hearing-date-month'],
						year: sessionValues['hearing-date-year'],
						hour: sessionValues['hearing-time-hour'],
						minute: sessionValues['hearing-time-minute']
					})
				: null;

		const inspectorName = await getInspectorFormattedEmailName(inspector, request);
		const timetable = /** @type {any} */ (sessionValues)?.timetable;

		await startCaseService.setStartDate(
			request.apiClient,
			appealId,
			getTodaysISOString(),
			sessionValues?.appealProcedure,
			hearingStartTime,
			hearingEstimatedDays,
			inspectorName,
			timetable
		);

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'caseStarted',
			appealId
		});

		if (!isGeneric && sessionValues?.appealProcedure === APPEAL_CASE_PROCEDURE.HEARING) {
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

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getStartCaseTimetable = async (request, response) => {
	return renderStartCaseTimetable(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderStartCaseTimetable = async (request, response) => {
	const { currentAppeal, errors } = request;
	const { appealId } = currentAppeal;
	const sessionValues = getSessionValuesForAppeal(request, 'startCaseAppealProcedure', appealId);
	const procedureType = sessionValues?.appealProcedure;

	let defaultBackLink = `/appeals-service/appeal-details/${appealId}/start-case/select-procedure`;
	if (procedureType === APPEAL_CASE_PROCEDURE.HEARING) {
		defaultBackLink = `/appeals-service/appeal-details/${appealId}/start-case/hearing/estimation`;
	} else if (procedureType === APPEAL_CASE_PROCEDURE.INQUIRY) {
		const inquiryValues = getSessionValuesForAppeal(request, 'setUpInquiry', appealId);
		defaultBackLink =
			inquiryValues?.addressKnown === 'yes'
				? `/appeals-service/appeal-details/${appealId}/inquiry/setup/address-details`
				: `/appeals-service/appeal-details/${appealId}/inquiry/setup/address`;
	}

	const backLinkUrl = getBackLinkUrl(
		request,
		defaultBackLink,
		`/appeals-service/appeal-details/${appealId}/start-case/select-procedure/check-and-confirm`
	);

	const appealTimetable = sessionValues?.timetable || request.session.appealTimetable || {};

	const mappedPageContent = mapEditTimetablePage(
		appealTimetable,
		currentAppeal,
		request.locals?.appellantCase,
		request.body,
		errors,
		backLinkUrl
	);

	return response.render('appeals/appeal/update-date.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postStartCaseTimetable = async (request, response) => {
	if (request.errors) {
		return renderStartCaseTimetable(request, response);
	}

	const { appealId } = request.currentAppeal;

	request.session.startCaseAppealProcedure = request.session.startCaseAppealProcedure || {};
	request.session.startCaseAppealProcedure[appealId] =
		request.session.startCaseAppealProcedure[appealId] || {};

	/** @type {Record<string, string>} */
	const timetable = {};
	/** @type {import('../timetable/timetable.mapper.js').AppealTimetableType[]} */
	const timetableTypes = [
		'lpaQuestionnaireDueDate',
		'lpaStatementDueDate',
		'ipCommentsDueDate',
		'finalCommentsDueDate',
		'statementOfCommonGroundDueDate',
		'planningObligationDueDate',
		'proofOfEvidenceAndWitnessesDueDate',
		'caseManagementConferenceDueDate'
	];

	timetableTypes.forEach((timetableType) => {
		const idText = getIdText(timetableType);
		const dateStr = buildSessionDate(request, idText);
		if (dateStr) {
			timetable[timetableType] = `${dateStr}T00:00:00.000Z`;
		}
	});

	request.session.startCaseAppealProcedure[appealId].timetable = timetable;
	request.session.appealTimetable = timetable;

	return response.redirect(
		preserveQueryString(
			request,
			`/appeals-service/appeal-details/${appealId}/start-case/select-procedure/check-and-confirm`
		)
	);
};
