import { postInspectorDecision, postInspectorInvalidReason } from './issue-decision.service.js';
import {
	appellantCostsDecisionPage,
	checkAndConfirmPage,
	issueDecisionPage,
	lpaCostsDecisionPage,
	viewDecisionPage
} from './issue-decision.mapper.js';
import {
	postDocumentUpload,
	renderDocumentUpload
} from '../../appeal-documents/appeal-documents.controller.js';

import { objectContainsAllKeys } from '#lib/object-utilities.js';
import {
	APPEAL_CASE_STAGE,
	APPEAL_CASE_STATUS,
	APPEAL_DOCUMENT_TYPE
} from '@planning-inspectorate/data-model';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { addBackLinkQueryToUrl, getBackLinkUrlFromQuery } from '#lib/url-utilities.js';
import { appealShortReference } from '#lib/appeals-formatter.js';
import { cloneDeep } from 'lodash-es';
import { mapFileUploadInfoToMappedDocuments } from '#lib/mappers/utils/file-upload-info-to-documents.js';
import { createNewDocument } from '#app/components/file-uploader.component.js';
import { dateISOStringToDisplayDate, getTodaysISOString } from '#lib/dates.js';
import {
	DECISION_TYPE_APPELLANT_COSTS,
	DECISION_TYPE_INSPECTOR
} from '@pins/appeals/constants/support.js';
import {
	baseUrl,
	buildLogicData,
	checkDecisionUrl,
	getDecisions,
	mapDecisionOutcome
} from '#appeals/appeal-details/issue-decision/issue-decision.utils.js';
import { isStatePassed } from '#lib/appeal-status.js';
import { getFileVersionsInfo } from '#appeals/appeal-documents/appeal.documents.service.js';

/**
 * @typedef {import('../../../appeals/appeal-documents/appeal-documents.types.js').FileUploadInfoItem} FileUploadInfoItem
 * @typedef {import('@pins/express/types/express.js').Request & {specificDecisionType?: string}} Request
 * @typedef {import("express-session").Session & Partial<import("express-session").SessionData>} Session
 * @typedef {import('../appeal-details.types.js').WebAppeal} Appeal
 */

/**
 * @param {Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postIssueDecision = async (request, response) => {
	const { currentAppeal, body, session, errors } = request;
	const { appealId } = currentAppeal;

	if (errors) {
		return renderIssueDecision(request, response);
	}

	if (session.inspectorDecision.outcome !== body.decision) {
		session.inspectorDecision = { appealId };
		session.appellantCostsDecision = { appealId };
		session.lpaCostsDecision = { appealId };
	}

	/** @type {import('./issue-decision.types.js').InspectorDecisionRequest} */
	session.inspectorDecision = {
		...request.session.inspectorDecision,
		outcome: body.decision,
		invalidReason: body.invalidReason
	};

	let nextPageUrl = `${baseUrl({ appealId })}/decision-letter-upload`;

	if (session.inspectorDecision.outcome === 'Invalid') {
		const {
			appellantHasAppliedForCosts,
			lpaHasAppliedForCosts,
			appellantDecisionHasAlreadyBeenIssued,
			lpaDecisionHasAlreadyBeenIssued
		} = buildLogicData(currentAppeal);

		if (appellantHasAppliedForCosts && !appellantDecisionHasAlreadyBeenIssued) {
			nextPageUrl = `${baseUrl(currentAppeal)}/appellant-costs-decision`;
		} else if (lpaHasAppliedForCosts && !lpaDecisionHasAlreadyBeenIssued) {
			nextPageUrl = `${baseUrl(currentAppeal)}/lpa-costs-decision`;
		} else {
			nextPageUrl = checkDecisionUrl(request);
		}
	}

	return response.redirect(nextPageUrl);
};

/**
 *
 * @param {Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const renderIssueDecision = async (request, response) => {
	const { errors, currentAppeal } = request;

	const mappedPageContent = issueDecisionPage(
		currentAppeal,
		errors
			? { outcome: request.body.decision, invalidReason: request.body.invalidReason }
			: request.session.inspectorDecision,
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
 * @param {Session} session
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
 * @param {Session} session
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

	if (shouldFollowReIssueDecisionFlow(currentAppeal)) {
		nextPageUrl = `/appeals-service/appeal-details/${currentAppeal.appealId}/update-decision-letter/correction-notice`;
	} else if (appellantHasAppliedForCosts && !appellantDecisionHasAlreadyBeenIssued) {
		nextPageUrl = `${baseUrl(currentAppeal)}/appellant-costs-decision`;
	} else if (lpaHasAppliedForCosts && !lpaDecisionHasAlreadyBeenIssued) {
		nextPageUrl = `${baseUrl(currentAppeal)}/lpa-costs-decision`;
	} else {
		nextPageUrl = checkDecisionUrl(request);
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
 * @param {Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const renderDecisionLetterUpload = async (request, response) => {
	const { currentAppeal } = request;

	request.currentFolder = {
		folderId: currentAppeal.decision?.folderId,
		path: `${APPEAL_CASE_STAGE.APPEAL_DECISION}/${APPEAL_DOCUMENT_TYPE.CASE_DECISION_LETTER}`
	};

	restoreFileUploadInfo(request.session, 'inspectorDecision');
	const captionSuffix = shouldFollowReIssueDecisionFlow(currentAppeal)
		? 'update decision letter'
		: 'issue decision';

	if (shouldFollowReIssueDecisionFlow(currentAppeal)) {
		request.params = {
			...request.params,
			documentId: currentAppeal.decision.documentId
		};
	}

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
		)} - ${captionSuffix}`,
		uploadContainerHeadingTextOverride: 'Upload decision letter',
		documentTitle: 'decision letter',
		allowMultipleFiles: false,
		allowedTypes: ['pdf']
	});
};

/**
 * @param {Request} request
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
		nextPageUrl = checkDecisionUrl(request);
	}
	return response.redirect(nextPageUrl);
};

/**
 *
 * @param {Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const renderAppellantCostsDecision = async (request, response) => {
	const { errors, currentAppeal, session } = request;

	const backUrl = session.inspectorDecision?.files?.length
		? `${baseUrl(currentAppeal)}/decision-letter-upload`
		: `${baseUrl(currentAppeal)}/decision`;

	const mappedPageContent = appellantCostsDecisionPage(
		currentAppeal,
		request.session.appellantCostsDecision,
		getBackLinkUrlFromQuery(request) || backUrl,
		errors
	);

	return response.status(200).render('patterns/change-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postAppellantCostsDecisionLetterUpload = async (request, response) => {
	// @ts-ignore
	const { currentAppeal, specificDecisionType, session } = request;

	if (!currentAppeal) {
		return response.status(404).render('app/404');
	}

	request.currentFolder = cloneDeep(currentAppeal.costs.appellantDecisionFolder);

	const { lpaHasAppliedForCosts, lpaDecisionHasAlreadyBeenIssued } = buildLogicData(currentAppeal);

	let nextPageUrl;
	if (!specificDecisionType && lpaHasAppliedForCosts && !lpaDecisionHasAlreadyBeenIssued) {
		nextPageUrl = `${baseUrl(currentAppeal)}/lpa-costs-decision`;
	} else {
		nextPageUrl = checkDecisionUrl(request);
	}

	await postDocumentUpload({
		request,
		response,
		nextPageUrl: addBackLinkQueryToUrl(request, nextPageUrl),
		callBack: async () => {
			storeFileUploadInfo(session, 'appellantCostsDecision');
		}
	});
};

/**
 *
 * @param {Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const renderAppellantCostsDecisionLetterUpload = async (request, response) => {
	const { currentAppeal, specificDecisionType } = request;

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
		preHeadingTextOverride: `Appeal ${appealShortReference(currentAppeal.appealReference)} ${
			specificDecisionType ? '- issue appellant costs decision' : '- issue decision'
		}`,
		uploadContainerHeadingTextOverride: 'Upload appellant costs decision letter',
		documentTitle: 'appellant costs decision letter',
		allowMultipleFiles: false,
		allowedTypes: ['pdf']
	});
};

/**
 * @param {Request} request
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

	return response.redirect(checkDecisionUrl(request));
};

/**
 *
 * @param {Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const renderLpaCostsDecision = async (request, response) => {
	const { errors, currentAppeal, session } = request;

	const { appellantHasAppliedForCosts, appellantDecisionHasAlreadyBeenIssued } =
		buildLogicData(currentAppeal);

	const backUrl =
		appellantHasAppliedForCosts && !appellantDecisionHasAlreadyBeenIssued
			? `${baseUrl(currentAppeal)}/appellant-costs-decision-letter-upload`
			: session.inspectorDecision?.files?.length
			? `${baseUrl(currentAppeal)}/decision-letter-upload`
			: `${baseUrl(currentAppeal)}/decision`;

	const mappedPageContent = lpaCostsDecisionPage(
		currentAppeal,
		request.session.lpaCostsDecision,
		getBackLinkUrlFromQuery(request) || backUrl,
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
		nextPageUrl: checkDecisionUrl(request),
		callBack: async () => {
			storeFileUploadInfo(session, 'lpaCostsDecision');
		}
	});
};

/**
 *
 * @param {Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const renderLpaCostsDecisionLetterUpload = async (request, response) => {
	const { currentAppeal, specificDecisionType } = request;

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
		preHeadingTextOverride: `Appeal ${appealShortReference(currentAppeal.appealReference)} ${
			specificDecisionType ? '- issue LPA costs decision' : '- issue decision'
		}`,
		uploadContainerHeadingTextOverride: 'Upload LPA costs decision letter',
		documentTitle: 'LPA costs decision letter',
		allowMultipleFiles: false,
		allowedTypes: ['pdf']
	});
};

/**
 * @param {object} params
 * @param {import('got').Got} params.apiClient
 * @param {{decisionType: string, appealId: number|string, folderId: number, letterDate: string, files: FileUploadInfoItem[]  }} params.decision - The decision object.
 * @returns {Promise<*>}
 */
const postDecisionDocument = async ({ apiClient, decision }) => {
	const { appealId, folderId, ...fileUploadInfo } = decision;

	const addDocumentsRequestPayload = mapFileUploadInfoToMappedDocuments({
		caseId: appealId,
		folderId,
		fileUploadInfo
	});

	await createNewDocument(apiClient, appealId, addDocumentsRequestPayload);
};

/**
 * @param {Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postCheckDecision = async (request, response) => {
	const { currentAppeal, session, params, apiClient } = request;

	if (!currentAppeal) {
		return response.status(500).render('app/500.njk');
	}

	const { invalidReason } = session.inspectorDecision || {};
	const { appealId } = params;

	const decisions = getDecisions(session);

	if (!decisions.length && !invalidReason) {
		return response.status(500).render('app/500.njk');
	}

	if (decisions.length) {
		await Promise.all(decisions.map((decision) => postDecisionDocument({ apiClient, decision })));
		const decisionsToPost = decisions.map((decision) => {
			const { decisionType, outcome, files } = decision;
			return {
				decisionType,
				documentGuid: files[0].GUID,
				documentDate: getTodaysISOString(),
				outcome:
					decisionType === DECISION_TYPE_INSPECTOR
						? mapDecisionOutcome(outcome).toLowerCase()
						: null
			};
		});

		if (decisionsToPost.length) {
			await postInspectorDecision(apiClient, appealId, decisionsToPost);
		}
	}

	if (invalidReason) {
		await postInspectorInvalidReason(request.apiClient, appealId, invalidReason);
	}

	addNotificationBannerToSession({
		session: request.session,
		bannerDefinitionKey: invalidReason ? 'issuedDecisionInvalid' : 'issuedDecisionValid',
		appealId
	});

	return response.redirect(`/appeals-service/appeal-details/${appealId}`);
};

/**
 * @param {Request} request
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

	const mappedPageContent = checkAndConfirmPage(currentAppeal, request);

	return response.status(200).render('appeals/appeal/issue-decision.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/**
 * @param {Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postCostsCheckDecision = async (request, response) => {
	const { errors, currentAppeal, session, params, apiClient, specificDecisionType } = request;
	const { appealId } = params;

	if (!currentAppeal) {
		return response.status(500).render('app/500.njk');
	}

	const decisions = getDecisions(session);

	if (decisions?.length !== 1) {
		return response.status(500).render('app/500.njk');
	}

	const decision = decisions[0];

	if (errors) {
		return renderCostsCheckDecision(request, response);
	}

	await postDecisionDocument({ apiClient, decision });
	const { decisionType, files } = decision;
	const decisionToPost = {
		decisionType,
		documentGuid: files[0].GUID,
		documentDate: getTodaysISOString(),
		outcome: null
	};

	await postInspectorDecision(apiClient, appealId, [decisionToPost]);

	const bannerDefinitionKey =
		specificDecisionType === DECISION_TYPE_APPELLANT_COSTS
			? 'appellantCostsDecisionIssued'
			: 'lpaCostsDecisionIssued';

	addNotificationBannerToSession({
		session: request.session,
		bannerDefinitionKey,
		appealId
	});

	return response.redirect(`/appeals-service/appeal-details/${appealId}`);
};

/**
 * @param {Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const renderCostsCheckDecision = async (request, response) => {
	const { errors, currentAppeal } = request;

	if (!currentAppeal) {
		return response.status(404).render('app/404.njk');
	}

	const mappedPageContent = checkAndConfirmPage(currentAppeal, request);

	return response.status(200).render('appeals/appeal/issue-decision.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/**
 * @param {Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const renderViewDecision = async (request, response) => {
	const { currentAppeal } = request;

	if (!currentAppeal) {
		return response.status(404).render('app/404.njk');
	}
	const { latestDocumentVersion: latestFileVersion, allVersions = [] } =
		(await getFileVersionsInfo(
			request.apiClient,
			currentAppeal.appealId.toString(),
			currentAppeal.decision.documentId || ''
		)) || {};
	const originalLetterDate = dateISOStringToDisplayDate(allVersions[0]?.dateReceived);

	const latestLetterDate = dateISOStringToDisplayDate(latestFileVersion?.dateReceived);

	let latestDecsionDocumentText;

	if (currentAppeal.decision?.outcome) {
		latestDecsionDocumentText =
			latestFileVersion && latestFileVersion?.version > 1
				? `${originalLetterDate} (reissued on ${latestLetterDate})`
				: `${latestLetterDate}`;
	}

	const mappedPageContent = viewDecisionPage(currentAppeal, request, latestDecsionDocumentText);

	return response.status(200).render('appeals/appeal/issue-decision.njk', {
		pageContent: mappedPageContent,
		viewOnly: true
	});
};

/**
 * entering re-issue decision flow if appeal state is already complete
 * @param {Appeal} currentAppeal
 */
const shouldFollowReIssueDecisionFlow = (currentAppeal) => {
	return isStatePassed(currentAppeal, APPEAL_CASE_STATUS.ISSUE_DETERMINATION);
};
