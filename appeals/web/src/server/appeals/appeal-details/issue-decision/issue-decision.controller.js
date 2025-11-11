import {
	postDocumentUpload,
	renderDocumentUpload
} from '../../appeal-documents/appeal-documents.controller.js';
import {
	appellantCostsDecisionPage,
	checkAndConfirmPage,
	decisionLetterPage,
	issueDecisionPage,
	lpaCostsDecisionPage,
	viewDecisionPage
} from './issue-decision.mapper.js';
import { postInspectorDecision } from './issue-decision.service.js';

import { createNewDocument } from '#app/components/file-uploader.component.js';
import {
	baseUrl,
	buildIssueDecisionLogicData,
	checkDecisionUrl,
	getDecisions,
	issueDecisionBackUrl,
	lpaCostsDecisionBackUrl
} from '#appeals/appeal-details/issue-decision/issue-decision.utils.js';
import { getAttachmentsFolder } from '#appeals/appeal-documents/appeal.documents.service.js';
import { isFeatureActive } from '#common/feature-flags.js';
import { isStatePassed } from '#lib/appeal-status.js';
import { getOriginalAndLatestLetterDatesObject, getTodaysISOString } from '#lib/dates.js';
import { preHeadingText } from '#lib/mappers/utils/appeal-preheading.js';
import { mapFileUploadInfoToMappedDocuments } from '#lib/mappers/utils/file-upload-info-to-documents.js';
import { isParentAppeal } from '#lib/mappers/utils/is-linked-appeal.js';
import { objectContainsAllKeys } from '#lib/object-utilities.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { addBackLinkQueryToUrl, getBackLinkUrlFromQuery } from '#lib/url-utilities.js';
import { FEATURE_FLAG_NAMES } from '@pins/appeals/constants/common.js';
import {
	CASE_OUTCOME_INVALID,
	DECISION_TYPE_APPELLANT_COSTS,
	DECISION_TYPE_INSPECTOR
} from '@pins/appeals/constants/support.js';
import {
	APPEAL_CASE_STAGE,
	APPEAL_CASE_STATUS,
	APPEAL_DOCUMENT_TYPE
} from '@planning-inspectorate/data-model';

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

	const { childAppealId } = request.params || {};

	const childAppeal =
		childAppealId &&
		currentAppeal.linkedAppeals.find(
			// @ts-ignore
			(linkedAppeal) => linkedAppeal.appealId === Number(childAppealId)
		);

	let nextLinkedAppeal;

	if (isParentAppeal(currentAppeal)) {
		if (childAppeal) {
			const currentChildIndex = currentAppeal.linkedAppeals.findIndex(
				// @ts-ignore
				(linkedAppeal) => linkedAppeal === childAppeal
			);
			nextLinkedAppeal = currentAppeal.linkedAppeals[currentChildIndex + 1];
		} else {
			nextLinkedAppeal = currentAppeal.linkedAppeals[0];
		}
	}

	let nextPageUrl = nextLinkedAppeal
		? `${baseUrl({ appealId })}/${nextLinkedAppeal.appealId}/decision`
		: `${baseUrl({ appealId })}/decision-letter-upload`;

	if (childAppeal) {
		const childDecision = session.childDecisions.decisions.find(
			// @ts-ignore
			(childDecision) => childDecision.appealId === childAppeal.appealId
		);
		if (childDecision) {
			childDecision.outcome = body.decision;
		} else {
			session.childDecisions.decisions.push({
				appealId: childAppeal.appealId,
				outcome: body.decision,
				appealReference: childAppeal.appealReference
			});
		}
	} else {
		if (session.inspectorDecision.outcome !== body.decision) {
			session.inspectorDecision = {
				appealId
			};
			session.appellantCostsDecision = { appealId };
			session.lpaCostsDecision = { appealId };
			session.childDecisions = { appealId, decisions: [] };
		}

		/** @type {import('./issue-decision.types.js').InspectorDecisionRequest} */
		session.inspectorDecision = {
			...request.session.inspectorDecision,
			outcome: body.decision,
			invalidReason: body.decision === CASE_OUTCOME_INVALID ? body.invalidReason : ''
		};
	}

	if (session.inspectorDecision.outcome === CASE_OUTCOME_INVALID) {
		if (isFeatureActive(FEATURE_FLAG_NAMES.INVALID_DECISION_LETTER)) {
			nextPageUrl = `${baseUrl(currentAppeal)}/decision-letter`;
		} else {
			const {
				appellantHasAppliedForCosts,
				lpaHasAppliedForCosts,
				appellantDecisionHasAlreadyBeenIssued,
				lpaDecisionHasAlreadyBeenIssued
			} = buildIssueDecisionLogicData(currentAppeal);

			if (appellantHasAppliedForCosts && !appellantDecisionHasAlreadyBeenIssued) {
				nextPageUrl = `${baseUrl(currentAppeal)}/appellant-costs-decision`;
			} else if (lpaHasAppliedForCosts && !lpaDecisionHasAlreadyBeenIssued) {
				nextPageUrl = `${baseUrl(currentAppeal)}/lpa-costs-decision`;
			} else {
				nextPageUrl = checkDecisionUrl(request);
			}
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
	const { errors, currentAppeal, session } = request;
	const { childAppealId } = request.params || {};

	const childAppeal =
		childAppealId &&
		currentAppeal.linkedAppeals.find(
			// @ts-ignore
			(linkedAppeal) => linkedAppeal.appealId === Number(childAppealId)
		);

	let inspectorDecision;
	if (errors) {
		inspectorDecision = {
			outcome: request.body.decision,
			invalidReason: request.body.invalidReason
		};
	} else if (childAppeal) {
		inspectorDecision = session.childDecisions.decisions.find(
			// @ts-ignore
			(childDecision) => childDecision.appealId === childAppeal.appealId
		);
	} else {
		inspectorDecision = session.inspectorDecision;
	}

	const mappedPageContent = issueDecisionPage(
		currentAppeal,
		childAppeal,
		inspectorDecision,
		getBackLinkUrlFromQuery(request) || issueDecisionBackUrl(currentAppeal, childAppealId, request),
		errors
	);

	return response.status(200).render('patterns/change-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/**
 * @param {Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postDecisionLetter = async (request, response) => {
	const { currentAppeal, params, body, session, errors } = request;

	if (errors) {
		return renderDecisionLetter(request, response);
	}

	/** @type {import('./issue-decision.types.js').DecisionLetterRequest} */
	session.decisionLetter = {
		appealId: params.appealId,
		...request.session.decisionLetter,
		outcome: body.decisionLetter
	};

	const { appellantHasAppliedForCosts, appellantDecisionHasAlreadyBeenIssued } =
		buildIssueDecisionLogicData(currentAppeal);

	let nextPageUrl;

	if (body.decisionLetter === 'true') {
		nextPageUrl = `${baseUrl(currentAppeal)}/decision-letter-upload`;
	} else {
		if (session.inspectorDecision.files) {
			session.inspectorDecision.files = [];
		}
		if (appellantHasAppliedForCosts && !appellantDecisionHasAlreadyBeenIssued) {
			nextPageUrl = `${baseUrl(currentAppeal)}/appellant-costs-decision`;
		} else {
			nextPageUrl = addBackLinkQueryToUrl(request, checkDecisionUrl(request));
		}
	}
	return response.redirect(nextPageUrl);
};

/**
 *
 * @param {Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const renderDecisionLetter = async (request, response) => {
	const { errors, currentAppeal } = request;

	const backUrl = `${baseUrl(currentAppeal)}/decision`;

	const mappedPageContent = decisionLetterPage(
		currentAppeal,
		request.session.decisionLetter,
		getBackLinkUrlFromQuery(request) || backUrl,
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
	const { outcome, invalidReason } = session[decisionType] || {};
	session[decisionType] = structuredClone({ outcome, invalidReason, ...session.fileUploadInfo });
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
	session.fileUploadInfo = structuredClone(session[decisionType] || {});
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
	} = buildIssueDecisionLogicData(currentAppeal);

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

	if (!shouldFollowReIssueDecisionFlow(currentAppeal)) {
		restoreFileUploadInfo(request.session, 'inspectorDecision');
	}
	const captionSuffix = shouldFollowReIssueDecisionFlow(currentAppeal)
		? 'update decision letter'
		: 'issue decision';

	if (shouldFollowReIssueDecisionFlow(currentAppeal)) {
		request.params = {
			...request.params,
			documentId: currentAppeal.decision.documentId
		};
	}

	const backUrl = request.session.inspectorDecision?.invalidReason
		? `${baseUrl(currentAppeal)}/decision-letter`
		: isParentAppeal(currentAppeal)
		? `${baseUrl(currentAppeal)}/${
				currentAppeal.linkedAppeals[currentAppeal.linkedAppeals.length - 1].appealId
		  }/decision`
		: `${baseUrl(currentAppeal)}/decision`;

	await renderDocumentUpload({
		request,
		response,
		appealDetails: currentAppeal,
		backButtonUrl: getBackLinkUrlFromQuery(request) || backUrl,
		pageHeadingTextOverride: 'Decision letter',
		preHeadingTextOverride: preHeadingText(currentAppeal, captionSuffix),
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

	const { lpaHasAppliedForCosts, lpaDecisionHasAlreadyBeenIssued } =
		buildIssueDecisionLogicData(currentAppeal);

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

	request.currentFolder = structuredClone(currentAppeal.costs.appellantDecisionFolder);

	const { lpaHasAppliedForCosts, lpaDecisionHasAlreadyBeenIssued } =
		buildIssueDecisionLogicData(currentAppeal);

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

	request.currentFolder = structuredClone(currentAppeal.costs.appellantDecisionFolder);

	restoreFileUploadInfo(request.session, 'appellantCostsDecision');

	await renderDocumentUpload({
		request,
		response,
		appealDetails: currentAppeal,
		backButtonUrl:
			getBackLinkUrlFromQuery(request) ||
			`/appeals-service/appeal-details/${request.params.appealId}/issue-decision/appellant-costs-decision`,
		pageHeadingTextOverride: 'Appellant costs decision letter',
		preHeadingTextOverride: preHeadingText(
			currentAppeal,
			specificDecisionType ? 'issue appellant costs decision' : 'issue decision'
		),
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
	const { errors, currentAppeal } = request;

	const backUrl = lpaCostsDecisionBackUrl(request);

	const mappedPageContent = lpaCostsDecisionPage(
		currentAppeal,
		request.session.lpaCostsDecision,
		backUrl,
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

	request.currentFolder = structuredClone(currentAppeal.costs.lpaDecisionFolder);

	await postDocumentUpload({
		request,
		response,
		nextPageUrl: addBackLinkQueryToUrl(request, checkDecisionUrl(request)),
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

	request.currentFolder = structuredClone(currentAppeal.costs.lpaDecisionFolder);

	restoreFileUploadInfo(request.session, 'lpaCostsDecision');

	await renderDocumentUpload({
		request,
		response,
		appealDetails: currentAppeal,
		backButtonUrl:
			getBackLinkUrlFromQuery(request) || `${baseUrl(currentAppeal)}/lpa-costs-decision`,
		pageHeadingTextOverride: 'LPA costs decision letter',
		preHeadingTextOverride: preHeadingText(
			currentAppeal,
			specificDecisionType ? 'issue LPA costs decision' : 'issue decision'
		),
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
		await Promise.all(
			decisions
				.filter((decision) => !decision.isChildAppeal)
				.map(
					async (decision) =>
						decision.files && (await postDecisionDocument({ apiClient, decision }))
				)
		);
		const decisionsToPost = decisions.map((decision) => {
			const {
				appealId,
				decisionType,
				outcome,
				files,
				invalidReason,
				isChildAppeal = false
			} = decision;
			return {
				appealId,
				decisionType,
				documentGuid: files && files[0].GUID,
				documentDate: getTodaysISOString(),
				outcome: decisionType === DECISION_TYPE_INSPECTOR ? outcome : null,
				invalidReason,
				isChildAppeal
			};
		});

		if (decisionsToPost.length) {
			await postInspectorDecision(apiClient, appealId, decisionsToPost);
		}
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
	const { currentAppeal, apiClient } = request;

	if (!currentAppeal) {
		return response.status(404).render('app/404.njk');
	}

	let letterDateObject = await getOriginalAndLatestLetterDatesObject(
		apiClient,
		currentAppeal.appealId.toString(),
		currentAppeal.decision.documentId || '',
		currentAppeal
	);
	let latestDecsionDocumentText;

	if (currentAppeal.decision?.outcome) {
		latestDecsionDocumentText =
			letterDateObject.latestFileVersion && letterDateObject.latestFileVersion?.version > 1
				? `${letterDateObject.originalLetterDate} (reissued on ${letterDateObject.latestLetterDate})`
				: `${letterDateObject.originalLetterDate}`;
	}

	if (currentAppeal.isChildAppeal) {
		const parentAppeal = currentAppeal.linkedAppeals.find(
			// @ts-ignore
			(linkedAppeal) => linkedAppeal.isParentAppeal
		);
		currentAppeal.leadDecisionLetter = await getAttachmentsFolder(
			apiClient,
			parentAppeal.appealId,
			`${APPEAL_CASE_STAGE.APPEAL_DECISION}/${APPEAL_DOCUMENT_TYPE.CASE_DECISION_LETTER}`
		);
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
