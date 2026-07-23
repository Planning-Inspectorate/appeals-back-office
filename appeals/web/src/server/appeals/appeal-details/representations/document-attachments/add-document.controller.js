import { createNewDocument } from '#app/components/file-uploader.component.js';
import {
	postDocumentDetails as postDocumentDetailsHelper,
	postDocumentUpload as postDocumentUploadHelper,
	renderDocumentDetails as renderDocumentDetailsHelper,
	renderDocumentUpload as renderDocumentUploadHelper,
	renderUploadDocumentsCheckAndConfirm
} from '#appeals/appeal-documents/appeal-documents.controller.js';
import { getDocumentRedactionStatuses } from '#appeals/appeal-documents/appeal.documents.service.js';
import { isAtEditEntrypoint } from '#lib/edit-utilities.js';
import logger from '#lib/logger.js';
import { constructUrl } from '#lib/mappers/utils/url.mapper.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { preserveQueryString } from '#lib/url-utilities.js';
import config from '@pins/appeals.web/environment/config.js';
import {
	APPEAL_REPRESENTATION_TYPE,
	REPRESENTATION_ADDED_AS_DOCUMENT
} from '@pins/appeals/constants/common.js';
import { REP_ATTACHMENT_DOCTYPE } from '@pins/appeals/constants/documents.js';
import {
	APPEAL_REDACTED_STATUS,
	APPEAL_REPRESENTATION_STATUS
} from '@planning-inspectorate/data-model';
import { postRepresentation } from '../representations.service.js';
import { patchRepresentationAttachments } from './attachments-service.js';

/** @typedef {import('#appeals/appeal-details/appeal-details.types.js').AppealRule6Party} AppealRule6Party */
/** @typedef {import('#appeals/appeal-details/representations/types.js').RepresentationRequest} RepresentationRequest */

export const redactionStatusFieldName = 'redactionStatus';

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const renderDocumentUpload = async (request, response) => {
	const {
		currentAppeal,
		session,
		query,
		locals: { pageContent }
	} = request;

	const baseUrl = request.baseUrl;
	const representationBaseUrl = request.baseUrl.replace('/add-document', '');

	let backButtonUrl =
		isAtEditEntrypoint(request) || query.change
			? preserveQueryString(request, `${baseUrl}/check-your-answers`, {
					exclude: ['editEntrypoint', 'change']
				})
			: query.backUrl
				? constructUrl(String(query.backUrl), currentAppeal.appealId)
				: representationBaseUrl;

	if (session.createNewRepresentation && !backButtonUrl.includes('check-your-answers')) {
		const appealDetailsUrlPattern = /^(\/appeals-service\/appeal-details\/[^/]+).*$/;
		backButtonUrl = request.baseUrl.replace(appealDetailsUrlPattern, '$1');
	}

	return renderDocumentUploadHelper({
		request,
		response,
		appealDetails: currentAppeal,
		backButtonUrl,
		nextPageUrl: `${baseUrl}/add-document-details`,
		pageHeadingTextOverride:
			pageContent?.addDocument?.pageHeadingTextOverride || 'Upload supporting documents',
		documentType: REP_ATTACHMENT_DOCTYPE,
		preHeadingTextOverride: pageContent?.pageHeadingTextOverride,
		uploadContainerHeadingTextOverride:
			pageContent?.addDocument?.uploadContainerHeadingTextOverride,
		documentTitle: pageContent?.addDocument?.documentTitle
	});
};

/**
 * @type {import('@pins/express/types/express.js').RequestHandler<{}>}
 */
export const postDocumentUpload = async (request, response) => {
	const baseUrl = request.baseUrl;

	await postDocumentUploadHelper({
		request,
		response,
		nextPageUrl: `${baseUrl}/add-document-details`
	});
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const renderDocumentDetails = async (request, response) => {
	const {
		currentAppeal,
		query,
		locals: { pageContent }
	} = request;

	const baseUrl = request.baseUrl;

	let backLinkUrl =
		isAtEditEntrypoint(request) || query.change
			? preserveQueryString(request, `${baseUrl}/check-your-answers`, {
					exclude: ['editEntrypoint', 'change']
				})
			: query.backUrl
				? constructUrl(String(query.backUrl), currentAppeal.appealId)
				: baseUrl;

	return renderDocumentDetailsHelper({
		request,
		response,
		backLinkUrl,
		pageHeadingTextOverride:
			pageContent?.addDocument?.pageHeadingTextOverride || 'Representation attachment documents'
	});
};

/**
 * @type {import('@pins/express/types/express.js').RequestHandler<{}>}
 */
export const postDocumentDetails = async (request, response) => {
	const { currentAppeal, currentFolder, query } = request;

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404.njk');
	}

	const baseUrl = request.baseUrl;

	let backLinkUrl =
		isAtEditEntrypoint(request) || query.change
			? preserveQueryString(request, `${baseUrl}/check-your-answers`, {
					exclude: ['editEntrypoint', 'change']
				})
			: query.backUrl
				? constructUrl(String(query.backUrl), currentAppeal.appealId)
				: baseUrl;

	const nextPageUrl = preserveQueryString(request, `${baseUrl}/check-your-answers`);

	await postDocumentDetailsHelper({
		request,
		response,
		backLinkUrl,
		nextPageUrl,
		pageHeadingTextOverride: 'Representation attachment documents'
	});
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const renderCheckYourAnswers = async (request, response) => {
	const { currentAppeal } = request;

	if (!currentAppeal) {
		return response.status(404).render('app/404');
	}

	const baseUrl = request.baseUrl;

	let backLinkUrl = preserveQueryString(request, `${baseUrl}/add-document-details`);

	return renderUploadDocumentsCheckAndConfirm({
		request,
		response,
		backLinkUrl,
		changeFileLinkUrl: baseUrl,
		changeDateLinkUrl: backLinkUrl,
		changeRedactionStatusLinkUrl: backLinkUrl
	});
};

/**
 * @type {import('@pins/express/types/express.js').RequestHandler<{}>}
 */
export const postCheckYourAnswers = async (request, response) => {
	const {
		apiClient,
		session,
		currentAppeal,
		currentRepresentation,
		session: { fileUploadInfo },
		params: { rule6PartyId }
	} = request;
	const { appealId } = currentAppeal;

	const representationType =
		currentRepresentation?.representationType ?? getRepresentationType(request.baseUrl);
	const id = currentRepresentation?.id;

	if (
		session.createNewRepresentation &&
		onlySingularRepresentationAllowed(representationType, currentRepresentation?.status)
	) {
		return response.status(409).render('app/409.njk');
	}

	const rule6Party = currentAppeal.appealRule6Parties?.find(
		(/** @type {AppealRule6Party} */ { id }) => id === Number(rule6PartyId)
	);

	const folderId = fileUploadInfo.folderId;

	try {
		const redactionStatuses = await getDocumentRedactionStatuses(apiClient);

		if (!redactionStatuses) throw new Error('Redaction statuses could not be retrieved');

		const noRedactionRequiredStatusId = redactionStatuses?.find(
			(status) => status.key === APPEAL_REDACTED_STATUS.NO_REDACTION_REQUIRED
		)?.id;

		if (!noRedactionRequiredStatusId) {
			throw new Error('Default redaction status not found.');
		}

		/** @type {import('@pins/appeals/index.js').AddDocumentsRequest} */
		const addDocumentsRequestPayload = {
			blobStorageHost:
				config.useBlobEmulator === true ? config.blobEmulatorSasUrl : config.blobStorageUrl,
			blobStorageContainer: config.blobStorageDefaultContainer,
			appellantCaseId: Number(currentAppeal.appellantCaseId),
			documents: fileUploadInfo.files.map(
				(/** @type {import('#lib/ts-utilities.js').FileUploadInfoItem} */ document) => {
					/** @type {import('@pins/appeals/index.js').MappedDocument} */
					const mappedDocument = {
						caseId: currentAppeal.appealId,
						documentName: document.name,
						documentType: document.documentType,
						mimeType: document.mimeType,
						documentSize: document.size,
						stage: document.stage,
						folderId,
						GUID: document.GUID,
						receivedDate: document.receivedDate,
						redactionStatusId: document.redactionStatus || noRedactionRequiredStatusId,
						blobStoragePath: document.blobStoreUrl
					};

					return mappedDocument;
				}
			)
		};

		await createNewDocument(apiClient, appealId, addDocumentsRequestPayload);

		const representedId = rule6Party?.serviceUserId;

		// @ts-ignore
		fileUploadInfo.files.map(async (document) => {
			const payload = buildPayload(
				representationType,
				document.GUID,
				document.redactionStatus,
				document.receivedDate,
				representedId
			);
			session.createNewRepresentation
				? await postRepresentation(request.apiClient, appealId, payload, representationType)
				: await patchRepresentationAttachments(apiClient, appealId, id, [document.GUID]);
		});
	} catch (error) {
		logger.error(
			error,
			error instanceof Error
				? error.message
				: 'An error occurred while attempting to submit a document.'
		);
		return response.status(500).render('app/500.njk');
	}

	delete session.fileUploadInfo;

	let nextPageUrl = request.baseUrl.split('/').slice(0, -1).join('/');

	/**@type {import('../../../../lib/mappers/index.js').NotificationBannerDefinitionKey} */
	let bannerDefinitionKey;
	/** @type {string|undefined} */
	let bannerText = undefined;

	switch (representationType) {
		case APPEAL_REPRESENTATION_TYPE.COMMENT:
			nextPageUrl = `${nextPageUrl}/review`;
			bannerDefinitionKey = 'interestedPartyCommentsDocumentAddedSuccess';
			break;
		case APPEAL_REPRESENTATION_TYPE.LPA_STATEMENT:
			bannerDefinitionKey = session.createNewRepresentation
				? 'lpaStatementAddedSuccess'
				: 'lpaStatementDocumentAddedSuccess';
			break;
		case APPEAL_REPRESENTATION_TYPE.LPA_PROOFS_EVIDENCE:
			if (!session.createNewRepresentation) {
				nextPageUrl = `${nextPageUrl}/manage-documents/${folderId}`;
			}
			bannerDefinitionKey = 'lpaProofOfEvidenceDocumentAddedSuccess';
			break;
		case APPEAL_REPRESENTATION_TYPE.APPELLANT_PROOFS_EVIDENCE:
			if (!session.createNewRepresentation) {
				nextPageUrl = `${nextPageUrl}/manage-documents/${folderId}`;
			}
			bannerDefinitionKey = 'appellantProofOfEvidenceDocumentAddedSuccess';
			break;
		case APPEAL_REPRESENTATION_TYPE.LPA_FINAL_COMMENT:
			bannerDefinitionKey = session.createNewRepresentation
				? 'lpaFinalCommentsAddedSuccess'
				: 'finalCommentsDocumentAddedSuccess';
			break;
		case APPEAL_REPRESENTATION_TYPE.APPELLANT_FINAL_COMMENT:
			bannerDefinitionKey = session.createNewRepresentation
				? 'appellantFinalCommentsAddedSuccess'
				: 'finalCommentsDocumentAddedSuccess';
			break;
		case APPEAL_REPRESENTATION_TYPE.RULE_6_PARTY_STATEMENT:
			bannerDefinitionKey = session.createNewRepresentation
				? 'rule6PartyStatementAddedSuccess'
				: 'rule6PartyStatementDocumentAddedSuccess';
			if (rule6Party && session.createNewRepresentation) {
				bannerText = `${rule6Party.serviceUser.organisationName} statement added`;
			}
			break;
		case APPEAL_REPRESENTATION_TYPE.RULE_6_PARTY_PROOFS_EVIDENCE:
			if (!session.createNewRepresentation) {
				nextPageUrl = `${nextPageUrl}/manage-documents/${folderId}`;
			}
			bannerDefinitionKey = session.createNewRepresentation
				? 'rule6PartyProofOfEvidenceAddedSuccess'
				: 'rule6PartyProofOfEvidenceDocumentAddedSuccess';
			if (rule6Party && session.createNewRepresentation) {
				bannerText = `${rule6Party.serviceUser.organisationName} proof of evidence and witnesses added`;
			}
			break;
		case APPEAL_REPRESENTATION_TYPE.APPELLANT_STATEMENT:
			nextPageUrl = `${nextPageUrl}/manage-documents/${folderId}`;
			bannerDefinitionKey = session.createNewRepresentation
				? 'appellantStatementAddedSuccess'
				: 'appellantStatementDocumentAddedSuccess';
			break;
		default:
			bannerDefinitionKey = 'finalCommentsDocumentAddedSuccess';
			break;
	}

	addNotificationBannerToSession({
		session,
		bannerDefinitionKey: bannerDefinitionKey,
		appealId,
		text: bannerText
	});

	if (session.createNewRepresentation) {
		delete session.createNewRepresentation;
	}

	return response.redirect(nextPageUrl);
};

/**
 * @param {string} representationType
 * @param {string} documentGuid
 * @param {string} redactionStatus
 * @param {string} createdDate
 * @param {number} [representedId]
 * @return {RepresentationRequest}
 */
export const buildPayload = (
	representationType,
	documentGuid,
	redactionStatus,
	createdDate,
	representedId
) => {
	const source = [
		APPEAL_REPRESENTATION_TYPE.APPELLANT_STATEMENT,
		APPEAL_REPRESENTATION_TYPE.APPELLANT_FINAL_COMMENT,
		APPEAL_REPRESENTATION_TYPE.APPELLANT_PROOFS_EVIDENCE,
		APPEAL_REPRESENTATION_TYPE.RULE_6_PARTY_STATEMENT,
		APPEAL_REPRESENTATION_TYPE.RULE_6_PARTY_PROOFS_EVIDENCE
	].includes(representationType)
		? 'citizen'
		: 'lpa';

	const isProofOfEvidence = [
		APPEAL_REPRESENTATION_TYPE.LPA_PROOFS_EVIDENCE,
		APPEAL_REPRESENTATION_TYPE.APPELLANT_PROOFS_EVIDENCE,
		APPEAL_REPRESENTATION_TYPE.RULE_6_PARTY_PROOFS_EVIDENCE
	].includes(representationType);

	return {
		attachments: [documentGuid],
		redactionStatus,
		source,
		dateCreated: createdDate,
		representationText: isProofOfEvidence ? null : REPRESENTATION_ADDED_AS_DOCUMENT,
		...(representedId ? { representedId } : {})
	};
};

/**
 * @param {string} url
 * @return {string}
 */
export const getRepresentationType = (url) => {
	const parts = url.split('/');

	const immediateParent = parts[parts.length - 2];
	const grandParent = parts[parts.length - 3];
	const greatGrandParent = parts[parts.length - 4];

	if (grandParent === 'final-comments') {
		return `${immediateParent}_final_comment`;
	}
	if (grandParent === 'rule-6-party-statement') {
		return 'rule_6_party_statement';
	}
	if (greatGrandParent === 'proof-of-evidence' && grandParent === 'rule-6-party') {
		return 'rule_6_party_proofs_evidence';
	}

	return immediateParent.replace(/-/g, '_');
};

/**
 * @param {string} representationType
 * @param {string} repStatus
 * @return {boolean}
 */
export const onlySingularRepresentationAllowed = (representationType, repStatus) => {
	return (
		[
			APPEAL_REPRESENTATION_TYPE.LPA_STATEMENT,
			APPEAL_REPRESENTATION_TYPE.APPELLANT_STATEMENT,
			APPEAL_REPRESENTATION_TYPE.LPA_FINAL_COMMENT,
			APPEAL_REPRESENTATION_TYPE.APPELLANT_FINAL_COMMENT
		].includes(representationType) &&
		repStatus !== undefined &&
		repStatus !== APPEAL_REPRESENTATION_STATUS.INVALID
	);
};

// export * from './controller/date-submitted.js';
// export { postRedactionStatus, renderRedactionStatus } from './controller/redaction-status.js';
