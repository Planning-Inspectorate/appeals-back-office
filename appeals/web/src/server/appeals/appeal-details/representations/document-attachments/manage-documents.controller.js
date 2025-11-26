import { patchRepresentationAttachments } from '#appeals/appeal-details/representations/document-attachments/attachments-service.js';
import {
	postChangeDocumentDetails,
	postChangeDocumentFileName,
	postDeleteDocument,
	postDocumentDetails,
	postDocumentUpload,
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
import logger from '#lib/logger.js';
import { constructUrl } from '#lib/mappers/utils/url.mapper.js';

/** @typedef {import("../../appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {import('#appeals/appeal-details/representations/types.js').Representation} Representation */

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getManageFolder = async (request, response) => {
	const {
		currentAppeal,
		query,
		locals: { pageContent }
	} = request;
	const manageFolderBaseUrl = request.baseUrl;

	const representationBackLinkUrlSegments = manageFolderBaseUrl.split('/').slice(0, -1);

	const backLinkUrl = query.backUrl
		? constructUrl(String(query.backUrl), currentAppeal.appealId)
		: representationBackLinkUrlSegments.includes('interested-party-comments')
		? representationBackLinkUrlSegments
				.toSpliced(representationBackLinkUrlSegments.length, 0, 'view')
				.join('/')
		: representationBackLinkUrlSegments.join('/');

	const addButtonUrl = manageFolderBaseUrl.replace('manage-documents', 'add-document');

	await renderManageFolder({
		request,
		response,
		backLinkUrl,
		viewAndEditUrl: `${manageFolderBaseUrl}/{{folderId}}/{{documentId}}`,
		addButtonUrl,
		pageHeadingTextOverride:
			pageContent?.manageDocuments?.pageHeadingTextOverride || 'Supporting documents',
		addButtonTextOverride: pageContent?.manageDocuments?.addButtonTextOverride || 'Add document',
		dateColumnLabelTextOverride:
			pageContent?.manageDocuments?.dateColumnLabelTextOverride || 'Date submitted',
		preHeadingTextOverride: pageContent?.manageDocuments?.preHeadingTextOverride || 'Manage folder'
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const goToManageDocuments = async (request, response) => {
	const { currentFolder } = request;
	const baseUrl = request.baseUrl;
	const rawQuery = request.originalUrl.split('?')[1];

	if (!currentFolder) {
		return response.status(404).render('app/404');
	}

	return response.redirect(`${baseUrl}/${currentFolder.folderId}${rawQuery ? `?${rawQuery}` : ''}`);
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getManageDocument = async (request, response) => {
	const baseUrl = request.baseUrl;

	await renderManageDocument({
		request,
		response,
		backLinkUrl: `${baseUrl}/{{folderId}}`,
		uploadUpdatedDocumentUrl: `${baseUrl}/add-documents/{{folderId}}/{{documentId}}`,
		removeDocumentUrl: `${baseUrl}/{{folderId}}/{{documentId}}/{{versionId}}/delete`,
		pageTitleTextOverride: 'Manage versions',
		dateRowLabelTextOverride: 'Date submitted',
		manageDocumentPageBaseUrl: 'manage-documents/'
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getDeleteDocument = async (request, response) => {
	const baseUrl = request.baseUrl;
	await renderDeleteDocument({
		request,
		response,
		backButtonUrl: `${baseUrl}/{{folderId}}/{{documentId}}`
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getChangeDocumentFileNameDetails = async (request, response) => {
	const baseUrl = request.baseUrl;

	await renderChangeDocumentFileName({
		request,
		response,
		backButtonUrl: `${baseUrl}/${request.params.folderId}/${request.params.documentId}`
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getChangeDocumentVersionDetails = async (request, response) => {
	const baseUrl = request.baseUrl;

	await renderChangeDocumentDetails({
		request,
		response,
		backButtonUrl: `${baseUrl}/${request.params.folderId}/${request.params.documentId}`
	});
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postDeleteDocumentPage = async (request, response) => {
	const baseUrl = request.baseUrl;
	const trimUrlOnDocumentDelete = request.locals?.pageContent?.trimUrlOnDocumentDelete ?? true;

	let basePath = baseUrl;
	if (trimUrlOnDocumentDelete) {
		basePath = baseUrl.split('/').slice(0, -1).join('/');
	}

	await postDeleteDocument({
		request,
		response,
		returnUrl: basePath,
		cancelUrl: `${baseUrl}/{{folderId}}/{{documentId}}`,
		uploadNewDocumentUrl: `${basePath}/add-document`
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postChangeDocumentFileNameDetails = async (request, response) => {
	const baseUrl = request.baseUrl;

	await postChangeDocumentFileName({
		request,
		response,
		backButtonUrl: `${baseUrl}/${request.params.folderId}/${request.params.documentId}`,
		nextPageUrl: `${baseUrl}/${request.params.folderId}/${request.params.documentId}`
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postChangeDocumentVersionDetails = async (request, response) => {
	const baseUrl = request.baseUrl;

	await postChangeDocumentDetails({
		request,
		response,
		backButtonUrl: `${baseUrl}/${request.params.folderId}/${request.params.documentId}`,
		nextPageUrl: `${baseUrl}/${request.params.folderId}/${request.params.documentId}`
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getAddDocumentVersion = async (request, response) => {
	const { currentAppeal, currentFolder } = request;
	const baseUrl = request.baseUrl;

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404.njk');
	}

	const allowedType = await getDocumentFileType(
		request.apiClient,
		currentAppeal.appealId,
		request.params.documentId
	);

	await renderDocumentUpload({
		request,
		response,
		appealDetails: currentAppeal,
		backButtonUrl: `${baseUrl}/${request.params.folderId}/${request.params.documentId}`,
		nextPageUrl: `${baseUrl}/add-document-details/${request.params.folderId}/${request.params.documentId}`,
		allowedTypes: allowedType ? [allowedType] : undefined,
		pageHeadingTextOverride: 'Supporting documents',
		uploadContainerHeadingTextOverride: 'Upload supporting documents'
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postAddDocumentVersion = async (request, response) => {
	const {
		currentAppeal,
		currentFolder,
		params: { documentId }
	} = request;
	const baseUrl = request.baseUrl;

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404');
	}

	await postDocumentUpload({
		request,
		response,
		nextPageUrl: `${baseUrl}/add-document-details/${currentFolder.folderId}/${documentId}`
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getAddDocumentVersionDetails = async (request, response) => {
	const {
		currentFolder,
		params: { folderId, documentId }
	} = request;
	const baseUrl = request.baseUrl;

	if (!currentFolder) {
		console.warn(`⚠️ currentFolder is undefined for folderId: ${folderId}. Rendering 404 page.`);
		return response.status(404).render('app/404');
	}

	try {
		await renderDocumentDetails({
			request,
			response,
			backLinkUrl: `${baseUrl}/add-documents/${folderId}/${documentId}`,
			documentId
		});
	} catch (error) {
		return response.status(500).render('app/500.njk');
	}
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postDocumentVersionDetails = async (request, response) => {
	const {
		currentFolder,
		params: { documentId }
	} = request;
	const baseUrl = request.baseUrl;

	await postDocumentDetails({
		request,
		response,
		backLinkUrl: `${baseUrl}/add-document-details/${currentFolder.folderId}/${documentId}`,
		nextPageUrl: `${baseUrl}/check-your-answers/${currentFolder.folderId}/${documentId}`
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getAddDocumentsCheckAndConfirm = async (request, response) => {
	const {
		currentFolder,
		params: { folderId, documentId }
	} = request;
	const baseUrl = request.baseUrl;

	if (!currentFolder) {
		return response.status(404).render('app/404');
	}

	const addDocumentDetailsPageUrl = `${baseUrl}/add-document-details/${request.params.folderId}/${request.params.documentId}`;

	await renderUploadDocumentsCheckAndConfirm({
		request,
		response,
		backLinkUrl: addDocumentDetailsPageUrl,
		changeFileLinkUrl: `${baseUrl}/add-documents/${folderId}/${documentId}`,
		changeDateLinkUrl: addDocumentDetailsPageUrl,
		changeRedactionStatusLinkUrl: addDocumentDetailsPageUrl
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postAddDocumentVersionCheckAndConfirm = async (request, response) => {
	const {
		currentAppeal,
		currentFolder,
		currentRepresentation,
		session: { fileUploadInfo },
		params: { folderId, documentId }
	} = request;
	const baseUrl = request.baseUrl;
	const uploadInfo = fileUploadInfo.files[0];

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404');
	}

	try {
		await postUploadDocumentVersionCheckAndConfirm({
			request,
			response
		});

		await patchRepresentationAttachments(
			request.apiClient,
			currentAppeal.appealId,
			currentRepresentation.id,
			[uploadInfo.GUID]
		);

		return response.redirect(`${baseUrl}/${folderId}/${documentId}`);
	} catch (error) {
		logger.error(
			error,
			error instanceof Error
				? error.message
				: 'Something went wrong when adding documents to lpa questionnaire'
		);

		return response.render('app/500.njk');
	}
};
