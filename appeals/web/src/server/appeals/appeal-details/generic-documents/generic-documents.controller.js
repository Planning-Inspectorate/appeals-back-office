import {
	postChangeDocumentDetails,
	postChangeDocumentFileName,
	postDeleteDocument,
	postDocumentDetails,
	postDocumentUpload,
	postUploadDocumentsCheckAndConfirm,
	postUploadDocumentVersionCheckAndConfirm,
	renderChangeDocumentDetails,
	renderChangeDocumentFileName,
	renderDeleteDocument,
	renderDocumentDetails,
	renderDocumentUpload,
	renderManageDocument,
	renderManageFolder,
	renderUploadDocumentsCheckAndConfirm
} from '#appeals/appeal-documents/appeal-documents.controller.js';
import { getDocumentFileType } from '#appeals/appeal-documents/appeal.documents.service.js';
import { getPageHeadingTextOverrideForFolder } from '#lib/mappers/utils/documents-and-folders.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { isGenericAppealType } from '@pins/appeals/utils/appeal-type-checks.js';
import { capitalizeFirstLetter } from '@pins/appeals/utils/string-case.js';
import { APPEAL_DOCUMENT_TYPE } from '@planning-inspectorate/data-model';

/**
 * @typedef {import('@pins/express/types/express.js').Request} Request
 * @typedef {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} Response
 */

/**
 * Check if the current request represents a generic appeal (create-a-case).
 *
 * @param {Request} req
 * @returns {boolean}
 */
export const isGenericAppeal = (req) => {
	if (req.currentAppeal?.appealType) {
		return isGenericAppealType(req.currentAppeal.appealType);
	}
	if (
		req.baseUrl?.includes('/lpa-questionnaire') ||
		req.originalUrl?.includes('/lpa-questionnaire')
	) {
		return !req.params.lpaQuestionnaireId;
	}
	return false;
};

/**
 * Route handler middleware that delegates to a generic document handler if the appeal is a generic appeal type (create-a-case), or calls standardHandler otherwise.
 *
 * @param {import('@pins/express').RequestHandler<any>} genericHandler
 * @param {import('@pins/express').RequestHandler<any>} standardHandler
 * @returns {import('@pins/express').RequestHandler<any>}
 */
export const routeByAppealType = (genericHandler, standardHandler) => (req, res, next) => {
	if (isGenericAppeal(req)) {
		return genericHandler(req, res, next);
	}
	return standardHandler(req, res, next);
};

/**
 * @param {Request} request
 * @returns {string}
 */
const getBaseUrl = (request) => {
	const appealId = request.params.appealId || request.currentAppeal?.appealId;
	const isLpaq = request.originalUrl.includes('/lpa-questionnaire');
	const section = isLpaq ? 'lpa-questionnaire' : 'appellant-case';
	return `/appeals-service/appeal-details/${appealId}/${section}`;
};

/**
 * @param {import('@pins/appeals.api').Appeals.FolderInfo} [folder]
 * @returns {{ uploadHeading: string; detailsHeading: string; bannerText: string }}
 */
const getGenericDocumentConfig = (folder) => {
	const folderName = folder?.path?.split('/')?.[1];
	if (folderName === APPEAL_DOCUMENT_TYPE.LPA_QUESTIONNAIRE) {
		return {
			uploadHeading: 'Upload questionnaire and questionnaire documents',
			detailsHeading: 'Questionnaire and questionnaire documents',
			bannerText: 'Questionnaire and questionnaire documents'
		};
	}
	return {
		uploadHeading: 'Upload appeal form and appeal documents',
		detailsHeading: 'Appeal form and appeal documents',
		bannerText: 'Appeal form and appeal documents'
	};
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getAddDocuments = async (request, response) => {
	const { currentAppeal, currentFolder } = request;

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404.njk');
	}

	const config = getGenericDocumentConfig(currentFolder);
	const baseUrl = getBaseUrl(request);

	await renderDocumentUpload({
		request,
		response,
		appealDetails: currentAppeal,
		backButtonUrl: `/appeals-service/appeal-details/${currentAppeal.appealId}`,
		nextPageUrl: `${baseUrl}/add-document-details/{{folderId}}`,
		isLateEntry: false,
		pageHeadingTextOverride: config.uploadHeading,
		documentTitle: config.detailsHeading
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postAddDocuments = async (request, response) => {
	const { currentAppeal, currentFolder } = request;

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404');
	}

	const baseUrl = getBaseUrl(request);

	await postDocumentUpload({
		request,
		response,
		nextPageUrl: `${baseUrl}/add-document-details/${currentFolder.folderId}`
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getAddDocumentDetails = async (request, response) => {
	const { currentAppeal, currentFolder } = request;

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404.njk');
	}

	const config = getGenericDocumentConfig(currentFolder);
	const baseUrl = getBaseUrl(request);

	await renderDocumentDetails({
		request,
		response,
		backLinkUrl: `${baseUrl}/add-documents/{{folderId}}`,
		isLateEntry: false,
		pageHeadingTextOverride: config.detailsHeading
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postAddDocumentDetails = async (request, response) => {
	const { currentFolder } = request;
	const config = getGenericDocumentConfig(currentFolder);
	const baseUrl = getBaseUrl(request);

	await postDocumentDetails({
		request,
		response,
		backLinkUrl: `${baseUrl}/add-documents/{{folderId}}`,
		nextPageUrl: `${baseUrl}/add-documents/{{folderId}}/check-your-answers`,
		pageHeadingTextOverride: config.detailsHeading
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getAddDocumentsCheckAndConfirm = async (request, response) => {
	const {
		currentAppeal,
		currentFolder,
		params: { documentId }
	} = request;

	if (!currentFolder || !currentAppeal) {
		return response.status(404).render('app/404');
	}

	const baseUrl = getBaseUrl(request);
	const addDocumentDetailsPageUrl = `${baseUrl}/add-document-details/${currentFolder.folderId}${
		documentId ? `/${documentId}` : ''
	}`;

	await renderUploadDocumentsCheckAndConfirm({
		request,
		response,
		backLinkUrl: addDocumentDetailsPageUrl,
		changeFileLinkUrl: `${baseUrl}/add-documents/${currentFolder.folderId}${
			documentId ? `/${documentId}` : ''
		}`,
		changeDateLinkUrl: addDocumentDetailsPageUrl,
		changeRedactionStatusLinkUrl: addDocumentDetailsPageUrl
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postAddDocumentsCheckAndConfirm = async (request, response) => {
	const { currentAppeal, currentFolder } = request;

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404');
	}

	const config = getGenericDocumentConfig(currentFolder);

	await postUploadDocumentsCheckAndConfirm({
		request,
		response,
		nextPageUrl: `/appeals-service/appeal-details/${currentAppeal.appealId}`,
		successCallback: () => {
			addNotificationBannerToSession({
				session: request.session,
				bannerDefinitionKey: 'documentAdded',
				appealId: currentAppeal.appealId,
				text: `${config.bannerText} added`
			});
		}
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postAddDocumentVersionCheckAndConfirm = async (request, response) => {
	const { currentAppeal } = request;

	if (!currentAppeal) {
		return response.status(404).render('app/404');
	}

	await postUploadDocumentVersionCheckAndConfirm({
		request,
		response,
		nextPageUrl: `/appeals-service/appeal-details/${currentAppeal.appealId}`
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getManageFolder = async (request, response) => {
	const { currentAppeal, currentFolder } = request;

	if (!currentFolder || !currentAppeal) {
		return response.status(404).render('app/404');
	}

	const config = getGenericDocumentConfig(currentFolder);
	const headingTextOverride = getPageHeadingTextOverrideForFolder(currentFolder);
	const baseUrl = getBaseUrl(request);

	await renderManageFolder({
		request,
		response,
		backLinkUrl: `/appeals-service/appeal-details/${currentAppeal.appealId}`,
		viewAndEditUrl: `${baseUrl}/manage-documents/{{folderId}}/{{documentId}}`,
		addButtonUrl: `${baseUrl}/add-documents/{{folderId}}`,
		pageHeadingTextOverride: headingTextOverride
			? capitalizeFirstLetter(headingTextOverride)
			: config.detailsHeading,
		canShare: false
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getManageDocument = async (request, response) => {
	const baseUrl = getBaseUrl(request);

	await renderManageDocument({
		request,
		response,
		backLinkUrl: `${baseUrl}/manage-documents/{{folderId}}`,
		uploadUpdatedDocumentUrl: `${baseUrl}/add-documents/{{folderId}}/{{documentId}}`,
		removeDocumentUrl: `${baseUrl}/manage-documents/{{folderId}}/{{documentId}}/{{versionId}}/delete`
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getAddDocumentVersion = async (request, response) => {
	const { apiClient, currentAppeal, currentFolder } = request;

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404.njk');
	}

	const config = getGenericDocumentConfig(currentFolder);
	const baseUrl = getBaseUrl(request);
	const allowedType = await getDocumentFileType(apiClient, request.params.documentId);

	await renderDocumentUpload({
		request,
		response,
		appealDetails: currentAppeal,
		backButtonUrl: `${baseUrl}/manage-documents/${request.params.folderId}/${request.params.documentId}`,
		nextPageUrl: `${baseUrl}/add-document-details/${request.params.folderId}/${request.params.documentId}`,
		isLateEntry: false,
		allowedTypes: allowedType ? [allowedType] : undefined,
		pageHeadingTextOverride: config.detailsHeading,
		uploadContainerHeadingTextOverride: `Upload ${config.detailsHeading.toLowerCase()}`
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postAddDocumentVersion = async (request, response) => {
	const {
		currentAppeal,
		currentFolder,
		params: { documentId }
	} = request;

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404');
	}

	const baseUrl = getBaseUrl(request);

	await postDocumentUpload({
		request,
		response,
		nextPageUrl: `${baseUrl}/add-document-details/${currentFolder.folderId}/${documentId}`
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getAddDocumentVersionDetails = async (request, response) => {
	const {
		currentAppeal,
		currentFolder,
		params: { documentId }
	} = request;

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404.njk');
	}

	const config = getGenericDocumentConfig(currentFolder);
	const baseUrl = getBaseUrl(request);

	await renderDocumentDetails({
		request,
		response,
		backLinkUrl: `${baseUrl}/add-documents/${request.params.folderId}/${request.params.documentId}`,
		isLateEntry: false,
		documentId,
		pageHeadingTextOverride: `Updated ${config.detailsHeading.toLowerCase()} document`
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postDocumentVersionDetails = async (request, response) => {
	const baseUrl = getBaseUrl(request);

	await postDocumentDetails({
		request,
		response,
		backLinkUrl: `${baseUrl}/add-documents/${request.params.folderId}/${request.params.documentId}`,
		nextPageUrl: `${baseUrl}/add-documents/${request.params.folderId}/${request.params.documentId}/check-your-answers`
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getChangeDocumentFileNameDetails = async (request, response) => {
	const baseUrl = getBaseUrl(request);

	await renderChangeDocumentFileName({
		request,
		response,
		backButtonUrl: `${baseUrl}/manage-documents/${request.params.folderId}/${request.params.documentId}`
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postChangeDocumentFileNameDetails = async (request, response) => {
	const baseUrl = getBaseUrl(request);

	await postChangeDocumentFileName({
		request,
		response,
		backButtonUrl: `${baseUrl}/manage-documents/${request.params.folderId}/${request.params.documentId}`,
		nextPageUrl: `${baseUrl}/manage-documents/${request.params.folderId}/${request.params.documentId}`
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getChangeDocumentVersionDetails = async (request, response) => {
	const baseUrl = getBaseUrl(request);

	await renderChangeDocumentDetails({
		request,
		response,
		backButtonUrl: `${baseUrl}/manage-documents/${request.params.folderId}/${request.params.documentId}`
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postChangeDocumentVersionDetails = async (request, response) => {
	const baseUrl = getBaseUrl(request);

	await postChangeDocumentDetails({
		request,
		response,
		backButtonUrl: `${baseUrl}/manage-documents/${request.params.folderId}/${request.params.documentId}`,
		nextPageUrl: `${baseUrl}/manage-documents/${request.params.folderId}/${request.params.documentId}`
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getDeleteDocument = async (request, response) => {
	const baseUrl = getBaseUrl(request);

	await renderDeleteDocument({
		request,
		response,
		backButtonUrl: `${baseUrl}/manage-documents/{{folderId}}/{{documentId}}`
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postDeleteDocumentPage = async (request, response) => {
	const baseUrl = getBaseUrl(request);

	await postDeleteDocument({
		request,
		response,
		returnUrl: `/appeals-service/appeal-details/${request.params.appealId}`,
		cancelUrl: `${baseUrl}/manage-documents/{{folderId}}/{{documentId}}`,
		uploadNewDocumentUrl: `${baseUrl}/add-documents/{{folderId}}`
	});
};
