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
	postDocumentUpload,
	postUploadDocumentsCheckAndConfirm
} from '../../appeal-documents/appeal-documents.controller.js';

import { objectContainsAllKeys } from '#lib/object-utilities.js';
import { APPEAL_CASE_STAGE, APPEAL_DOCUMENT_TYPE } from 'pins-data-model';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { getBackLinkUrlFromQuery } from '#lib/url-utilities.js';
import { appealShortReference } from '#lib/appeals-formatter.js';
import { cloneDeep } from 'lodash-es';

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
 * @param {string} documentType
 */
function storeFileUploadInfo(session, documentType) {
	const { inspectorDecision = {} } = session;
	if (!inspectorDecision.fileUploadInfo) {
		inspectorDecision.fileUploadInfo = {};
	}

	if (session.fileUploadInfo) {
		inspectorDecision.fileUploadInfo[documentType] = cloneDeep(session.fileUploadInfo);
		session.inspectorDecision = inspectorDecision;
	}
}

/**
 *
 * @param {import("express-session").Session & Partial<import("express-session").SessionData>} session
 * @param {string} documentType
 */
function restoreFileUploadInfo(session, documentType) {
	const { fileUploadInfo = {} } = session.inspectorDecision || {};

	if (fileUploadInfo[documentType]) {
		session.fileUploadInfo = fileUploadInfo[documentType];
	} else {
		delete session.fileUploadInfo;
	}
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
			storeFileUploadInfo(session, APPEAL_DOCUMENT_TYPE.CASE_DECISION_LETTER);
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
	const documentType = APPEAL_DOCUMENT_TYPE.CASE_DECISION_LETTER;

	request.currentFolder = {
		folderId: currentAppeal.decision?.folderId,
		path: `${APPEAL_CASE_STAGE.APPEAL_DECISION}/${documentType}`
	};

	restoreFileUploadInfo(request.session, documentType);

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
	const { errors } = request;

	const appealId = request.params.appealId;
	const appealData = request.currentAppeal;

	if (
		request.session?.appellantCostsDecision?.appealId &&
		request.session?.appellantCostsDecision?.appealId !== appealId
	) {
		request.session.appellantCostsDecision = {};
	}

	const mappedPageContent = appellantCostsDecisionPage(
		appealData,
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

	request.currentFolder = {
		folderId: currentAppeal.appellantDecisionFolder?.folderId,
		path: `${APPEAL_CASE_STAGE.APPEAL_DECISION}/${APPEAL_DOCUMENT_TYPE.APPELLANT_COSTS_DECISION_LETTER}`
	};

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
			storeFileUploadInfo(session, APPEAL_DOCUMENT_TYPE.APPELLANT_COSTS_DECISION_LETTER);
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
	const documentType = APPEAL_DOCUMENT_TYPE.APPELLANT_COSTS_DECISION_LETTER;

	request.currentFolder = {
		folderId: currentAppeal.appellantDecisionFolder?.folderId,
		path: `${APPEAL_CASE_STAGE.APPEAL_DECISION}/${documentType}`
	};

	restoreFileUploadInfo(request.session, documentType);

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
	const { errors } = request;

	const appealId = request.params.appealId;
	const appealData = request.currentAppeal;

	if (
		request.session?.lpaCostsDecision?.appealId &&
		request.session?.lpaCostsDecision?.appealId !== appealId
	) {
		request.session.lpaCostsDecision = {};
	}

	const mappedPageContent = lpaCostsDecisionPage(
		appealData,
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

	request.currentFolder = {
		folderId: currentAppeal.lpaDecisionFolder?.folderId,
		path: `${APPEAL_CASE_STAGE.APPEAL_DECISION}/${APPEAL_DOCUMENT_TYPE.LPA_COSTS_DECISION_LETTER}`
	};

	await postDocumentUpload({
		request,
		response,
		nextPageUrl: `/appeals-service/appeal-details/${currentAppeal.appealId}/issue-decision/check-your-decision`,
		callBack: async () => {
			storeFileUploadInfo(session, APPEAL_DOCUMENT_TYPE.LPA_COSTS_DECISION_LETTER);
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
	const documentType = APPEAL_DOCUMENT_TYPE.LPA_COSTS_DECISION_LETTER;

	request.currentFolder = {
		folderId: currentAppeal.lpaDecisionFolder?.folderId,
		path: `${APPEAL_CASE_STAGE.APPEAL_DECISION}/${documentType}`
	};

	restoreFileUploadInfo(request.session, documentType);

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

	const mappedPageContent = checkAndConfirmPage(currentAppeal, session);

	return response.status(200).render('appeals/appeal/issue-decision.njk', {
		pageContent: mappedPageContent,
		errors
	});
};
