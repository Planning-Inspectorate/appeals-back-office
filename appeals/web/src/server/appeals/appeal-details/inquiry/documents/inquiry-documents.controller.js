import {
	postChangeDocumentDetails,
	postDocumentDetails,
	postDocumentUpload,
	postUploadDocumentsCheckAndConfirm,
	postUploadDocumentVersionCheckAndConfirm,
	renderChangeDocumentDetails,
	renderDocumentDetails,
	renderDocumentUpload,
	renderManageDocument,
	renderManageFolder,
	renderUploadDocumentsCheckAndConfirm
} from '#appeals/appeal-documents/appeal-documents.controller.js';
import { getDocumentFileType } from '#appeals/appeal-documents/appeal.documents.service.js';
import logger from '#lib/logger.js';
import { mapFolderNameToDisplayLabel } from '#lib/mappers/utils/documents-and-folders.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { APPEAL_DOCUMENT_TYPE } from '@planning-inspectorate/data-model';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getManageFolder = async (request, response) => {
	const { currentAppeal, currentFolder } = request;

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404.njk');
	}

	const baseUrl = `/appeals-service/appeal-details/${currentAppeal.appealId}/inquiry/documents`;

	await renderManageFolder({
		request,
		response,
		backLinkUrl: `/appeals-service/appeal-details/${currentAppeal.appealId}`,
		viewAndEditUrl: `${baseUrl}/manage-documents/{{folderId}}/{{documentId}}`,
		addButtonUrl: `${baseUrl}/upload-documents/{{folderId}}`,
		pageHeadingTextOverride: 'Inquiry documents',
		addButtonTextOverride: 'Add documents',
		canShare: true,
		shareAllLinkUrl: `/appeals-service/appeal-details/${currentAppeal.appealId}/inquiry/documents/manage-documents/${currentFolder.folderId}/share-all`
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getManageDocument = async (request, response) => {
	const { currentAppeal, currentFolder } = request;

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404.njk');
	}
	const baseUrl = `/appeals-service/appeal-details/${currentAppeal.appealId}/inquiry/documents`;

	await renderManageDocument({
		request,
		response,
		pageTitleTextOverride: 'Inquiry documents',
		backLinkUrl: `${baseUrl}/manage-documents/{{folderId}}`,
		uploadUpdatedDocumentUrl: `${baseUrl}/upload-documents/{{folderId}}/{{documentId}}`,
		removeDocumentUrl: `${baseUrl}/manage-documents/{{folderId}}/{{documentId}}/{{versionId}}/delete`
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getInquiryDocumentUpload = async (request, response) => {
	const { currentAppeal, currentFolder } = request;

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404.njk');
	}

	const baseUrl = `/appeals-service/appeal-details/${currentAppeal.appealId}/inquiry/documents`;

	await renderDocumentUpload({
		request,
		response,
		documentTitle: 'inquiry documents',
		pageHeadingTextOverride: 'Upload inquiry documents',
		appealDetails: currentAppeal,
		documentType: APPEAL_DOCUMENT_TYPE.INQUIRY_CORE,
		backButtonUrl: `${baseUrl}/manage-documents/${currentFolder.folderId}`,
		nextPageUrl: `${baseUrl}/add-document-details/${currentFolder.folderId}`
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postInquiryDocumentUpload = async (request, response) => {
	const { currentAppeal, currentFolder } = request;
	const baseUrl = `/appeals-service/appeal-details/${currentAppeal.appealId}/inquiry/documents`;

	await postDocumentUpload({
		request,
		response,
		nextPageUrl: `${baseUrl}/add-document-details/${currentFolder.folderId}`
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getInquiryDocumentVersionUpload = async (request, response) => {
	const {
		apiClient,
		currentAppeal,
		currentFolder,
		params: { documentId }
	} = request;

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404.njk');
	}

	const baseUrl = `/appeals-service/appeal-details/${currentAppeal.appealId}/inquiry/documents`;

	const allowedType = await getDocumentFileType(apiClient, documentId);

	await renderDocumentUpload({
		request,
		response,
		appealDetails: currentAppeal,
		backButtonUrl: `${baseUrl}/manage-documents/${currentFolder.folderId}/${documentId}`,
		nextPageUrl: `${baseUrl}/add-document-details/${currentFolder.folderId}/${documentId}`,
		allowMultipleFiles: true,
		allowedTypes: allowedType ? [allowedType] : undefined,
		documentTitle: 'inquiry documents',
		pageHeadingTextOverride: 'Upload inquiry documents',
		documentType: APPEAL_DOCUMENT_TYPE.INQUIRY_CORE
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postInquiryDocumentVersionUpload = async (request, response) => {
	const {
		currentAppeal,
		currentFolder,
		params: { documentId }
	} = request;

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404');
	}

	const baseUrl = `/appeals-service/appeal-details/${currentAppeal.appealId}/inquiry/documents`;

	await postDocumentUpload({
		request,
		response,
		nextPageUrl: `${baseUrl}/add-document-details/${currentFolder.folderId}/${documentId}`
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getAddDocumentDetails = async (request, response) => {
	const { currentAppeal, currentFolder } = request;

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404.njk');
	}

	const baseUrl = `/appeals-service/appeal-details/${currentAppeal.appealId}/inquiry/documents`;

	await renderDocumentDetails({
		request,
		response,
		backLinkUrl: `${baseUrl}/upload-documents/${currentFolder.folderId}`,
		pageHeadingTextOverride: 'Inquiry document'
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postAddDocumentDetails = async (request, response) => {
	const {
		currentAppeal,
		currentFolder,
		params: { documentId }
	} = request;
	const baseUrl = `/appeals-service/appeal-details/${currentAppeal.appealId}/inquiry/documents`;

	const documentIdFragment = documentId ? `/${documentId}` : '';

	await postDocumentDetails({
		request,
		response,
		backLinkUrl: `${baseUrl}/upload-documents/${currentFolder.folderId}`,
		nextPageUrl: `${baseUrl}/check-your-answers/${currentFolder?.folderId}${documentIdFragment}`,
		pageHeadingTextOverride: 'Inquiry document'
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getAddInquiryDocumentsCheckAndConfirm = async (request, response) => {
	const {
		currentAppeal,
		currentFolder,
		params: { documentId }
	} = request;

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404');
	}
	const baseUrl = `/appeals-service/appeal-details/${currentAppeal.appealId}/inquiry/documents`;

	const addDocumentDetailsPageUrl = `${baseUrl}/add-document-details/${currentFolder.folderId}${
		documentId ? `/${documentId}` : ''
	}`;

	await renderUploadDocumentsCheckAndConfirm({
		request,
		response,
		backLinkUrl: addDocumentDetailsPageUrl,
		changeFileLinkUrl: `${baseUrl}/upload-documents/${currentFolder.folderId}${
			documentId ? `/${documentId}` : ''
		}`,
		changeDateLinkUrl: addDocumentDetailsPageUrl,
		changeRedactionStatusLinkUrl: addDocumentDetailsPageUrl
	});
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postAddInquiryDocumentsCheckAndConfirm = async (request, response) => {
	const { currentAppeal, currentFolder, session } = request;

	if (!currentAppeal) {
		return response.status(404).render('app/404');
	}

	try {
		await postUploadDocumentsCheckAndConfirm({
			request,
			response,
			nextPageUrl: `/appeals-service/appeal-details/${currentAppeal.appealId}`,
			successCallback: () => {
				addNotificationBannerToSession({
					session,
					bannerDefinitionKey: 'documentAdded',
					appealId: currentAppeal.appealId,
					text: `${mapFolderNameToDisplayLabel(currentFolder.path)} added`
				});
			}
		});
	} catch (error) {
		logger.error(
			error,
			error instanceof Error
				? error.message
				: 'Something went wrong when adding an inquiry document'
		);

		return response.status(500).render('app/500.njk');
	}
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postAddDocumentVersionCheckAndConfirm = async (request, response) => {
	const { currentAppeal } = request;

	if (!currentAppeal) {
		return response.status(404).render('app/404');
	}

	try {
		await postUploadDocumentVersionCheckAndConfirm({
			request,
			response,
			nextPageUrl: `/appeals-service/appeal-details/${currentAppeal.appealId}`
		});
	} catch (error) {
		logger.error(
			error,
			error instanceof Error
				? error.message
				: 'Something went wrong when adding an inquiry document version'
		);

		return response.status(500).render('app/500.njk');
	}
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getChangeInquiryDocumentVersionDetails = async (request, response) => {
	await renderChangeDocumentDetails({
		request,
		response,
		backButtonUrl: `/appeals-service/appeal-details/${request.params.appealId}/inquiry/documents/manage-documents/${request.params.folderId}/${request.params.documentId}`
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postChangeInquiryDocumentVersionDetails = async (request, response) => {
	await postChangeDocumentDetails({
		request,
		response,
		backButtonUrl: `/appeals-service/appeal-details/${request.params.appealId}/supporting-documents/manage-documents/${request.params.folderId}/${request.params.documentId}`,
		nextPageUrl: `/appeals-service/appeal-details/${request.params.appealId}/supporting-documents/manage-documents/${request.params.folderId}/${request.params.documentId}`
	});
};
