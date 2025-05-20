import { postInspectorDecision } from './issue-decision.service.js';
import {
	checkAndConfirmPage,
	issueDecisionPage,
	mapDecisionOutcome,
	appellantCostsDecisionPage,
	lpaCostsDecisionPage
} from './issue-decision.mapper.js';
import {
	renderDocumentUpload,
	postDocumentUpload
} from '../../appeal-documents/appeal-documents.controller.js';

import { objectContainsAllKeys } from '#lib/object-utilities.js';
import { APPEAL_CASE_STAGE, APPEAL_DOCUMENT_TYPE } from 'pins-data-model';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { getBackLinkUrlFromQuery } from '#lib/url-utilities.js';
import { appealShortReference } from '#lib/appeals-formatter.js';
import { cloneDeep } from 'lodash-es';
import { mapFileUploadInfoToMappedDocuments } from '#lib/mappers/utils/file-upload-info-to-documents.js';
import { createNewDocument } from '#app/components/file-uploader.component.js';
import { getTodaysISOString } from '#lib/dates.js';

/** @typedef {import('../../../appeals/appeal-documents/appeal-documents.types.js').FileUploadInfoItem} FileUploadInfoItem */

/**
 *
 * @param {import('../appeal-details.types.js').WebAppeal} currentAppeal
 * @returns {{appellantHasAppliedForCosts: boolean, lpaHasAppliedForCosts: boolean, appellantDecisionHasAlreadyBeenIssued: boolean, lpaDecisionHasAlreadyBeenIssued: boolean}}
 */
function buildLogicData(currentAppeal) {
	const appellantApplicationDocumentsExists =
		!!currentAppeal.costs?.appellantApplicationFolder?.documents?.length;
	const appellantWithdrawalDocumentsExists =
		!!currentAppeal.costs?.appellantWithdrawalFolder?.documents?.length;
	const lpaApplicationDocumentsExists =
		!!currentAppeal.costs?.lpaApplicationFolder?.documents?.length;
	const lpaWithdrawalDocumentsExists =
		!!currentAppeal.costs?.lpaWithdrawalFolder?.documents?.length;
	const appellantDecisionLetterExists =
		!!currentAppeal.costs?.appellantDecisionFolder?.documents?.length;
	const lpaDecisionLetterExists = !!currentAppeal.costs?.lpaDecisionFolder?.documents?.length;
	return {
		appellantHasAppliedForCosts:
			appellantApplicationDocumentsExists && !appellantWithdrawalDocumentsExists,
		lpaHasAppliedForCosts: lpaApplicationDocumentsExists && !lpaWithdrawalDocumentsExists,
		appellantDecisionHasAlreadyBeenIssued: appellantDecisionLetterExists,
		lpaDecisionHasAlreadyBeenIssued: lpaDecisionLetterExists
	};
}

/**
 *
 * @param {import('../appeal-details.types.js').WebAppeal} currentAppeal
 * @returns {string}
 */
function baseUrl(currentAppeal) {
	return `/appeals-service/appeal-details/${currentAppeal.appealId}/issue-decision`;
}

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
	const { errors, currentAppeal } = request;

	const mappedPageContent = issueDecisionPage(
		currentAppeal,
		request.session.inspectorDecision,
		getBackLinkUrlFromQuery(request),
		errors
	);

	return response.status(200).render('patterns/change-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/**
 *
 * @param {import("express-session").Session & Partial<import("express-session").SessionData>} session
 * @param {string} decisionType
 */
function storeFileUploadInfo(session, decisionType) {
	// Note that postDocumentUpload and renderDocumentUpload functions use the fileUploadInfo at the route of the session object.
	// This makes sure the values are stored in the session for the decision type so the session.fileUploadInfo can be reused.
	const { outcome } = session[decisionType] || {};
	session[decisionType] = cloneDeep({ outcome, ...session.fileUploadInfo });
	delete session.fileUploadInfo;
}

/**
 *
 * @param {import("express-session").Session & Partial<import("express-session").SessionData>} session
 * @param {string} decisionType
 */
function restoreFileUploadInfo(session, decisionType) {
	// Note that postDocumentUpload and renderDocumentUpload functions use the fileUploadInfo at the route of the session object.
	// This makes sure the values are restored from the session for the decision type so the session.fileUploadInfo can be reused.
	session.fileUploadInfo = cloneDeep(session[decisionType] || {});
}

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postDecisionLetterUpload = async (request, response) => {
	const { currentAppeal, session } = request;

	if (!currentAppeal) {
		return response.status(404).render('app/404');
	}

	request.currentFolder = {
		folderId: currentAppeal.decision?.folderId,
		path: `${APPEAL_CASE_STAGE.APPEAL_DECISION}/${APPEAL_DOCUMENT_TYPE.CASE_DECISION_LETTER}`
	};

	const {
		appellantHasAppliedForCosts,
		lpaHasAppliedForCosts,
		appellantDecisionHasAlreadyBeenIssued,
		lpaDecisionHasAlreadyBeenIssued
	} = buildLogicData(currentAppeal);

	let nextPageUrl;

	if (appellantHasAppliedForCosts && !appellantDecisionHasAlreadyBeenIssued) {
		nextPageUrl = `${baseUrl(currentAppeal)}/appellant-costs-decision`;
	} else if (lpaHasAppliedForCosts && !lpaDecisionHasAlreadyBeenIssued) {
		nextPageUrl = `${baseUrl(currentAppeal)}/lpa-costs-decision`;
	} else {
		nextPageUrl = `${baseUrl(currentAppeal)}/check-your-decision`;
	}

	await postDocumentUpload({
		request,
		response,
		nextPageUrl,
		callBack: async () => {
			storeFileUploadInfo(session, 'inspectorDecision');
		}
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

	restoreFileUploadInfo(request.session, 'inspectorDecision');

	await renderDocumentUpload({
		request,
		response,
		appealDetails: currentAppeal,
		backButtonUrl:
			getBackLinkUrlFromQuery(request) ||
			`/appeals-service/appeal-details/${request.params.appealId}/issue-decision/decision`,
		pageHeadingTextOverride: 'Decision letter',
		preHeadingTextOverride: `Appeal ${appealShortReference(
			currentAppeal.appealReference
		)} - issue decision`,
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
export const postAppellantCostsDecision = async (request, response) => {
	const { currentAppeal, params, body, session, errors } = request;

	if (errors) {
		return renderAppellantCostsDecision(request, response);
	}

	/** @type {import('./issue-decision.types.js').AppellantCostsDecisionRequest} */
	session.appellantCostsDecision = {
		appealId: params.appealId,
		...request.session.appellantCostsDecision,
		outcome: body.appellantCostsDecision
	};

	const { lpaHasAppliedForCosts, lpaDecisionHasAlreadyBeenIssued } = buildLogicData(currentAppeal);

	let nextPageUrl;

	if (body.appellantCostsDecision === 'true') {
		nextPageUrl = `${baseUrl(currentAppeal)}/appellant-costs-decision-letter-upload`;
	} else if (lpaHasAppliedForCosts && !lpaDecisionHasAlreadyBeenIssued) {
		nextPageUrl = `${baseUrl(currentAppeal)}/lpa-costs-decision`;
	} else {
		nextPageUrl = `${baseUrl(currentAppeal)}/check-your-decision`;
	}
	return response.redirect(nextPageUrl);
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const renderAppellantCostsDecision = async (request, response) => {
	const { errors, currentAppeal } = request;

	const mappedPageContent = appellantCostsDecisionPage(
		currentAppeal,
		request.session.appellantCostsDecision,
		getBackLinkUrlFromQuery(request),
		errors
	);

	return response.status(200).render('patterns/change-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postAppellantCostsDecisionLetterUpload = async (request, response) => {
	const { currentAppeal, session } = request;

	if (!currentAppeal) {
		return response.status(404).render('app/404');
	}

	request.currentFolder = cloneDeep(currentAppeal.costs.appellantDecisionFolder);

	const { lpaHasAppliedForCosts, lpaDecisionHasAlreadyBeenIssued } = buildLogicData(currentAppeal);

	let nextPageUrl;
	if (lpaHasAppliedForCosts && !lpaDecisionHasAlreadyBeenIssued) {
		nextPageUrl = `${baseUrl(currentAppeal)}/lpa-costs-decision`;
	} else {
		nextPageUrl = `${baseUrl(currentAppeal)}/check-your-decision`;
	}

	await postDocumentUpload({
		request,
		response,
		nextPageUrl,
		callBack: async () => {
			storeFileUploadInfo(session, 'appellantCostsDecision');
		}
	});
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const renderAppellantCostsDecisionLetterUpload = async (request, response) => {
	const { currentAppeal } = request;

	request.currentFolder = cloneDeep(currentAppeal.costs.appellantDecisionFolder);

	restoreFileUploadInfo(request.session, 'appellantCostsDecision');

	await renderDocumentUpload({
		request,
		response,
		appealDetails: currentAppeal,
		backButtonUrl:
			getBackLinkUrlFromQuery(request) ||
			`/appeals-service/appeal-details/${request.params.appealId}/issue-decision/appellant-costs-decision`,
		pageHeadingTextOverride: 'Appellant costs decision letter',
		preHeadingTextOverride: `Appeal ${appealShortReference(
			currentAppeal.appealReference
		)} - issue decision`,
		uploadContainerHeadingTextOverride: 'Upload appellant costs decision letter',
		documentTitle: 'appellant costs decision letter',
		allowMultipleFiles: false,
		allowedTypes: ['pdf']
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postLpaCostsDecision = async (request, response) => {
	const { params, body, session, errors } = request;

	if (errors) {
		return renderLpaCostsDecision(request, response);
	}

	/** @type {import('./issue-decision.types.js').LpaCostsDecisionRequest} */
	session.lpaCostsDecision = {
		appealId: params.appealId,
		...request.session.lpaCostsDecision,
		outcome: body.lpaCostsDecision
	};

	if (body.lpaCostsDecision === 'true') {
		return response.redirect(
			`/appeals-service/appeal-details/${params.appealId}/issue-decision/lpa-costs-decision-letter-upload`
		);
	}

	return response.redirect(
		`/appeals-service/appeal-details/${params.appealId}/issue-decision/check-your-decision`
	);
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const renderLpaCostsDecision = async (request, response) => {
	const { errors, currentAppeal } = request;

	const mappedPageContent = lpaCostsDecisionPage(
		currentAppeal,
		request.session.lpaCostsDecision,
		getBackLinkUrlFromQuery(request),
		errors
	);

	return response.status(200).render('patterns/change-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postLpaCostsDecisionLetterUpload = async (request, response) => {
	const { currentAppeal, session } = request;

	if (!currentAppeal) {
		return response.status(404).render('app/404');
	}

	request.currentFolder = cloneDeep(currentAppeal.costs.lpaDecisionFolder);

	await postDocumentUpload({
		request,
		response,
		nextPageUrl: `/appeals-service/appeal-details/${currentAppeal.appealId}/issue-decision/check-your-decision`,
		callBack: async () => {
			storeFileUploadInfo(session, 'lpaCostsDecision');
		}
	});
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const renderLpaCostsDecisionLetterUpload = async (request, response) => {
	const { currentAppeal } = request;

	request.currentFolder = cloneDeep(currentAppeal.costs.lpaDecisionFolder);

	restoreFileUploadInfo(request.session, 'lpaCostsDecision');

	await renderDocumentUpload({
		request,
		response,
		appealDetails: currentAppeal,
		backButtonUrl:
			getBackLinkUrlFromQuery(request) ||
			`/appeals-service/appeal-details/${request.params.appealId}/issue-decision/lpa-costs-decision`,
		pageHeadingTextOverride: 'LPA costs decision letter',
		preHeadingTextOverride: `Appeal ${appealShortReference(
			currentAppeal.appealReference
		)} - issue decision`,
		uploadContainerHeadingTextOverride: 'Upload LPA costs decision letter',
		documentTitle: 'LPA costs decision letter',
		allowMultipleFiles: false,
		allowedTypes: ['pdf']
	});
};

/**
 * @param {object} params
 * @param {import('got').Got} params.apiClient
 * @param {{appealId: number|string, folderId: number, letterDate: string, files: FileUploadInfoItem[]  }} params.decision - The decision object.
 * @returns {Promise<*>}
 */
const postDecision = async ({ apiClient, decision }) => {
	const { appealId, folderId, ...fileUploadInfo } = decision;

	const addDocumentsRequestPayload = mapFileUploadInfoToMappedDocuments({
		caseId: appealId,
		folderId,
		fileUploadInfo
	});

	await createNewDocument(apiClient, appealId, addDocumentsRequestPayload);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postCheckDecision = async (request, response) => {
	const { errors, currentAppeal, session, params, apiClient } = request;
	const { appealId } = params;

	if (!currentAppeal) {
		return response.status(500).render('app/500.njk');
	}

	const { inspectorDecision, appellantCostsDecision, lpaCostsDecision } = session;

	const decisions = [inspectorDecision, appellantCostsDecision, lpaCostsDecision].filter(
		(decision) => decision?.files?.length
	);

	if (!decisions.length) {
		return response.status(500).render('app/500.njk');
	}

	if (errors) {
		return renderCheckDecision(request, response);
	}

	await Promise.all(decisions.map((decision) => postDecision({ apiClient, decision })));

	await postInspectorDecision(
		apiClient,
		appealId,
		mapDecisionOutcome(inspectorDecision.outcome).toLowerCase(),
		inspectorDecision.files[0].GUID,
		getTodaysISOString()
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

	const mappedPageContent = checkAndConfirmPage(currentAppeal, session);

	return response.status(200).render('appeals/appeal/issue-decision.njk', {
		pageContent: mappedPageContent,
		errors
	});
};
