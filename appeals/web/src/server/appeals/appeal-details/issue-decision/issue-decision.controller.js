import { postInspectorDecision, postInspectorInvalidReason } from './issue-decision.service.js';
import { HTTPError } from 'got';
import {
	checkAndConfirmPage,
	dateDecisionLetterPage,
	issueDecisionPage,
	mapDecisionOutcome,
	invalidReasonPage,
	checkAndConfirmInvalidPage
} from './issue-decision.mapper.js';
import {
	renderDocumentUpload,
	postDocumentUpload,
	postUploadDocumentsCheckAndConfirm
} from '../../appeal-documents/appeal-documents.controller.js';
import {
	dayMonthYearHourMinuteToISOString,
	dateISOStringToDayMonthYearHourMinute
} from '#lib/dates.js';

import { objectContainsAllKeys } from '#lib/object-utilities.js';
import { APPEAL_CASE_STAGE, APPEAL_DOCUMENT_TYPE } from 'pins-data-model';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { getBackLinkUrlFromQuery } from '#lib/url-utilities.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postIssueDecision = async (request, response) => {
	const { params, body, session, errors } = request;

	if (errors) {
		return renderIssueDecision(request, response);
	}

	/** @type {import('./issue-decision.types.js').InspectorDecisionRequest} */
	session.inspectorDecision = {
		appealId: params.appealId,
		...request.session.inspectorDecision,
		outcome: body.decision
	};

	return response.redirect(
		`/appeals-service/appeal-details/${params.appealId}/issue-decision/decision-letter-upload`
	);
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const renderIssueDecision = async (request, response) => {
	const { errors } = request;

	const appealId = request.params.appealId;
	const appealData = request.currentAppeal;

	if (
		request.session?.inspectorDecision?.appealId &&
		request.session?.inspectorDecision?.appealId !== appealId
	) {
		request.session.inspectorDecision = {};
	}

	const mappedPageContent = issueDecisionPage(
		appealData,
		request.session.inspectorDecision,
		getBackLinkUrlFromQuery(request)
	);

	return response.status(200).render('patterns/change-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postDecisionLetterUpload = async (request, response) => {
	const { currentAppeal } = request;

	if (!currentAppeal) {
		return response.status(404).render('app/404');
	}

	request.currentFolder = {
		folderId: currentAppeal.decision?.folderId,
		path: `${APPEAL_CASE_STAGE.APPEAL_DECISION}/${APPEAL_DOCUMENT_TYPE.CASE_DECISION_LETTER}`
	};

	await postDocumentUpload({
		request,
		response,
		nextPageUrl: `/appeals-service/appeal-details/${currentAppeal.appealId}/issue-decision/decision-letter-date`
	});
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const renderDecisionLetterUpload = async (request, response) => {
	const { currentAppeal } = request;

	request.currentFolder = {
		folderId: currentAppeal.decision?.folderId,
		path: `${APPEAL_CASE_STAGE.APPEAL_DECISION}/${APPEAL_DOCUMENT_TYPE.CASE_DECISION_LETTER}`
	};

	await renderDocumentUpload({
		request,
		response,
		appealDetails: currentAppeal,
		backButtonUrl: `/appeals-service/appeal-details/${request.params.appealId}/issue-decision/decision`,
		nextPageUrl: `/appeals-service/appeal-details/${request.params.appealId}/issue-decision/decision-letter-date`,
		pageHeadingTextOverride: 'Decision letter',
		uploadContainerHeadingTextOverride: 'Upload decision letter',
		documentTitle: 'decision letter',
		allowMultipleFiles: false,
		allowedTypes: ['pdf']
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postDateDecisionLetter = async (request, response) => {
	const { appealId } = request.params;
	const {
		'decision-letter-date-day': day,
		'decision-letter-date-month': month,
		'decision-letter-date-year': year
	} = request.body;
	const { errors } = request;

	if (errors) {
		return renderDateDecisionLetter(request, response);
	}

	/** @type {import('./issue-decision.types.js').InspectorDecisionRequest} */
	request.session.inspectorDecision = {
		...request.session.inspectorDecision,
		letterDate: dayMonthYearHourMinuteToISOString({ year, month, day })
	};

	return response.redirect(
		`/appeals-service/appeal-details/${appealId}/issue-decision/check-your-decision`
	);
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const renderDateDecisionLetter = async (request, response) => {
	const { errors, currentAppeal, session } = request;

	if (!currentAppeal) {
		return response.status(404).render('app/404.njk');
	}

	if (!objectContainsAllKeys(session, ['fileUploadInfo', 'inspectorDecision'])) {
		return response.status(500).render('app/500.njk');
	}

	/** @type {import('./issue-decision.types.js').InspectorDecisionRequest} */
	request.session.inspectorDecision = {
		...session.inspectorDecision,
		documentId: session.fileUploadInfo.files[0].GUID
	};

	let decisionLetterDay = request.body['decision-letter-date-day'];
	let decisionLetterMonth = request.body['decision-letter-date-month'];
	let decisionLetterYear = request.body['decision-letter-date-year'];

	if (!decisionLetterDay || !decisionLetterMonth || !decisionLetterYear) {
		if (request.session.inspectorDecision?.letterDate) {
			const letterDate = dateISOStringToDayMonthYearHourMinute(
				request.session.inspectorDecision.letterDate
			);
			decisionLetterDay = letterDate.day;
			decisionLetterMonth = letterDate.month;
			decisionLetterYear = letterDate.year;
		}
	}

	const mappedPageContent = dateDecisionLetterPage(
		currentAppeal,
		decisionLetterDay,
		decisionLetterMonth,
		decisionLetterYear
	);

	return response.status(200).render('patterns/change-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postInvalidReason = async (request, response) => {
	const { appealId } = request.params;
	const { decisionInvalidReason: invalidReason } = request.body;
	const { errors } = request;
	if (errors) {
		return renderInvalidReason(request, response);
	}

	/** @type {import('./issue-decision.types.js').InspectorDecisionRequest} */
	request.session.inspectorDecision = {
		...request.session.inspectorDecision,
		invalidReason: invalidReason
	};

	return response.redirect(
		`/appeals-service/appeal-details/${appealId}/issue-decision/check-invalid-decision`
	);
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const renderInvalidReason = async (request, response) => {
	const { errors } = request;

	const appealData = request.currentAppeal;

	if (!appealData) {
		return response.status(404).render('app/404.njk');
	}

	const invalidReason =
		request.body['decisionInvalidReason'] || request.session.inspectorDecision?.invalidReason;

	const mappedPageContent = invalidReasonPage(appealData, invalidReason);

	return response.status(200).render('patterns/change-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postCheckDecision = async (request, response) => {
	const { appealId } = request.params;
	const { errors, currentAppeal } = request;

	if (!currentAppeal) {
		return response.status(500).render('app/500.njk');
	}

	if (!objectContainsAllKeys(request.session, 'fileUploadInfo')) {
		return response.status(500).render('app/500.njk');
	}

	request.currentFolder = {
		folderId: currentAppeal.decision?.folderId,
		path: `${APPEAL_CASE_STAGE.APPEAL_DECISION}/${APPEAL_DOCUMENT_TYPE.CASE_DECISION_LETTER}`
	};

	if (errors) {
		return renderCheckDecision(request, response);
	}

	const decisionOutcome = request.session.inspectorDecision.outcome;
	const documentId = request.session.inspectorDecision.documentId;

	await postUploadDocumentsCheckAndConfirm({ request, response });

	await postInspectorDecision(
		request.apiClient,
		appealId,
		mapDecisionOutcome(decisionOutcome).toLowerCase(),
		documentId,
		request.session.inspectorDecision.letterDate
	);

	addNotificationBannerToSession({
		session: request.session,
		bannerDefinitionKey: 'issuedDecisionValid',
		appealId
	});

	return response.redirect(`/appeals-service/appeal-details/${appealId}`);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const renderCheckDecision = async (request, response) => {
	const { errors, currentAppeal, session } = request;

	if (!currentAppeal) {
		return response.status(404).render('app/404.njk');
	}

	if (!currentAppeal.decision || !objectContainsAllKeys(session, ['inspectorDecision'])) {
		return response.status(500).render('app/500.njk');
	}

	const mappedPageContent = checkAndConfirmPage(currentAppeal, request.session);

	return response.status(200).render('appeals/appeal/issue-decision.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const renderCheckInvalidDecision = async (request, response) => {
	const { errors } = request;
	const appealData = request.currentAppeal;

	if (!appealData) {
		return response.status(404).render('app/404.njk');
	}

	const mappedPageContent = checkAndConfirmInvalidPage(
		request,
		appealData,
		request.session.inspectorDecision
	);

	return response.status(200).render('appeals/appeal/issue-decision.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postCheckInvalidDecision = async (request, response) => {
	const { appealId } = request.params;
	const { errors } = request;

	if (errors) {
		return renderCheckInvalidDecision(request, response);
	}

	const invalidReason = request.session.inspectorDecision.invalidReason;

	try {
		await postInspectorInvalidReason(request.apiClient, appealId, invalidReason);

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'issuedDecisionInvalid',
			appealId
		});

		return response.redirect(`/appeals-service/appeal-details/${appealId}`);
	} catch (error) {
		if (error instanceof HTTPError && error.response.statusCode === 400) {
			// @ts-ignore
			request.errors = error.response.body.errors;
			return renderCheckInvalidDecision(request, response);
		}

		throw error;
	}
};
