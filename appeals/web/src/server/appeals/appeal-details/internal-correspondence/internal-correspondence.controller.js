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
import logger from '#lib/logger.js';
import { mapFolderNameToDisplayLabel } from '#lib/mappers/utils/documents-and-folders.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { capitalizeFirstLetter } from '#lib/string-utilities.js';
import { capitalize } from 'lodash-es';
import { documentNameFromCategory } from './internal-correspondence.service.js';

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getDocumentUpload = async (request, response) => {
	const {
		currentAppeal,
		currentFolder,
		params: { correspondenceCategory }
	} = request;

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404.njk');
	}

	if (!['cross-team', 'inspector', 'appellant', 'main-party'].includes(correspondenceCategory)) {
		return response.status(400).render('app/500.njk');
	}

	let pageHeadingTextOverride = `Upload ${correspondenceCategory} correspondence`;
	if (correspondenceCategory === 'main-party')
		pageHeadingTextOverride = 'Upload main party correspondence';

	await renderDocumentUpload({
		request,
		response,
		appealDetails: currentAppeal,
		backButtonUrl: `/appeals-service/appeal-details/${currentAppeal.appealId}`,
		nextPageUrl: `/appeals-service/appeal-details/${currentAppeal.appealId}/internal-correspondence/${correspondenceCategory}/add-document-details/${currentFolder.folderId}`,
		pageHeadingTextOverride
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postDocumentUploadPage = async (request, response) => {
	const {
		currentAppeal,
		currentFolder,
		params: { correspondenceCategory }
	} = request;

	await postDocumentUpload({
		request,
		response,
		nextPageUrl: `/appeals-service/appeal-details/${currentAppeal.appealId}/internal-correspondence/${correspondenceCategory}/add-document-details/${currentFolder.folderId}`
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getDocumentVersionUpload = async (request, response) => {
	const {
		apiClient,
		currentAppeal,
		currentFolder,
		params: { correspondenceCategory, documentId }
	} = request;

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404.njk');
	}

	const allowedType = await getDocumentFileType(apiClient, documentId);

	const documentName = documentNameFromCategory(correspondenceCategory);

	await renderDocumentUpload({
		request,
		response,
		appealDetails: currentAppeal,
		backButtonUrl: `/appeals-service/appeal-details/${currentAppeal.appealId}/internal-correspondence/${correspondenceCategory}/manage-documents/${currentFolder.folderId}/${documentId}`,
		nextPageUrl: `/appeals-service/appeal-details/${currentAppeal.appealId}/internal-correspondence/${correspondenceCategory}/add-document-details/${currentFolder.folderId}/${documentId}`,
		allowMultipleFiles: false,
		allowedTypes: allowedType ? [allowedType] : undefined,
		...(documentName && {
			pageHeadingTextOverride: capitalizeFirstLetter(documentName),
			uploadContainerHeadingTextOverride: `Upload ${documentName}`
		})
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postDocumentVersionUpload = async (request, response) => {
	const {
		currentAppeal,
		currentFolder,
		params: { correspondenceCategory, documentId }
	} = request;

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404');
	}

	await postDocumentUpload({
		request,
		response,
		nextPageUrl: `/appeals-service/appeal-details/${currentAppeal.appealId}/internal-correspondence/${correspondenceCategory}/add-document-details/${currentFolder.folderId}/${documentId}`
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getAddDocumentDetails = async (request, response) => {
	const {
		currentAppeal,
		currentFolder,
		params: { correspondenceCategory, documentId }
	} = request;

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404.njk');
	}

	let pageHeadingTextOverride = `${capitalize(correspondenceCategory)} correspondence`;
	if (correspondenceCategory === 'main-party')
		pageHeadingTextOverride = 'Main party correspondence';

	await renderDocumentDetails({
		request,
		response,
		backLinkUrl: `/appeals-service/appeal-details/${
			currentAppeal.appealId
		}/internal-correspondence/${correspondenceCategory}/upload-documents/${
			currentFolder?.folderId
		}${documentId ? `/${documentId}` : ''}`,
		pageHeadingTextOverride,
		documentId
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postAddDocumentDetails = async (request, response) => {
	const {
		currentAppeal,
		currentFolder,
		params: { correspondenceCategory, documentId }
	} = request;

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404.njk');
	}

	await postDocumentDetails({
		request,
		response,
		backLinkUrl: `/appeals-service/appeal-details/${currentAppeal.appealId}/internal-correspondence/${correspondenceCategory}/upload-documents/${currentFolder?.folderId}`,
		nextPageUrl: `/appeals-service/appeal-details/${
			currentAppeal.appealId
		}/internal-correspondence/${correspondenceCategory}/check-your-answers/${
			currentFolder?.folderId
		}${documentId ? `/${documentId}` : ''}`,
		pageHeadingTextOverride: `${capitalize(correspondenceCategory)} correspondence`
	});
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getAddDocumentsCheckAndConfirm = async (request, response) => {
	const {
		currentAppeal,
		currentFolder,
		params: { correspondenceCategory, documentId }
	} = request;

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404');
	}

	const addDocumentDetailsPageUrl = `/appeals-service/appeal-details/${
		currentAppeal.appealId
	}/internal-correspondence/${correspondenceCategory}/add-document-details/${
		currentFolder.folderId
	}${documentId ? `/${documentId}` : ''}`;

	await renderUploadDocumentsCheckAndConfirm({
		request,
		response,
		backLinkUrl: addDocumentDetailsPageUrl,
		changeFileLinkUrl: `/appeals-service/appeal-details/${
			currentAppeal.appealId
		}/internal-correspondence/${correspondenceCategory}/upload-documents/${currentFolder.folderId}${
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
export const postAddDocumentsCheckAndConfirm = async (request, response) => {
	const {
		currentAppeal,
		currentFolder,
		session,
		params: { correspondenceCategory }
	} = request;

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
					bannerDefinitionKey: 'internalCorrespondenceDocumentAdded',
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
				: `Something went wrong when adding ${correspondenceCategory} correspondence documents`
		);

		return response.status(500).render('app/500.njk');
	}
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postAddDocumentVersionCheckAndConfirm = async (request, response) => {
	const {
		currentAppeal,
		params: { correspondenceCategory }
	} = request;

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
				: `Something went wrong when adding ${correspondenceCategory} correspondence document version`
		);

		return response.status(500).render('app/500.njk');
	}
};

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getManageFolder = async (request, response) => {
	const {
		currentAppeal,
		currentFolder,
		params: { correspondenceCategory }
	} = request;

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404.njk');
	}

	let pageHeadingTextOverride = `${capitalize(correspondenceCategory)} correspondence documents`;
	if (correspondenceCategory === 'main-party')
		pageHeadingTextOverride = 'Main party correspondence documents';

	await renderManageFolder({
		request,
		response,
		backLinkUrl: `/appeals-service/appeal-details/${currentAppeal.appealId}`,
		viewAndEditUrl: `/appeals-service/appeal-details/${currentAppeal.appealId}/internal-correspondence/${correspondenceCategory}/manage-documents/${currentFolder.folderId}/{{documentId}}`,
		addButtonUrl: `/appeals-service/appeal-details/${currentAppeal.appealId}/internal-correspondence/${correspondenceCategory}/upload-documents/${currentFolder.folderId}`,
		pageHeadingTextOverride
	});
};

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getManageDocument = async (request, response) => {
	const {
		currentAppeal,
		currentFolder,
		params: { correspondenceCategory }
	} = request;

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404.njk');
	}

	await renderManageDocument({
		request,
		response,
		backLinkUrl: `/appeals-service/appeal-details/${currentAppeal.appealId}/internal-correspondence/${correspondenceCategory}/manage-documents/${currentFolder.folderId}`,
		uploadUpdatedDocumentUrl: `/appeals-service/appeal-details/${currentAppeal.appealId}/internal-correspondence/${correspondenceCategory}/upload-documents/${currentFolder?.folderId}/{{documentId}}`,
		removeDocumentUrl: `/appeals-service/appeal-details/${currentAppeal.appealId}/internal-correspondence/${correspondenceCategory}/manage-documents/${currentFolder.folderId}/{{documentId}}/{{versionId}}/delete`
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getChangeDocumentFileNameDetails = async (request, response) => {
	const {
		params: { appealId, correspondenceCategory, folderId, documentId }
	} = request;

	await renderChangeDocumentFileName({
		request,
		response,
		backButtonUrl: `/appeals-service/appeal-details/${appealId}/internal-correspondence/${correspondenceCategory}/manage-documents/${folderId}/${documentId}`
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postChangeDocumentFileNameDetails = async (request, response) => {
	const {
		params: { appealId, correspondenceCategory, folderId, documentId }
	} = request;

	await postChangeDocumentFileName({
		request,
		response,
		backButtonUrl: `/appeals-service/appeal-details/${appealId}/internal-correspondence/${correspondenceCategory}/manage-documents/${folderId}/${documentId}`,
		nextPageUrl: `/appeals-service/appeal-details/${appealId}/internal-correspondence/${correspondenceCategory}/manage-documents/${folderId}/${documentId}`
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getChangeDocumentVersionDetails = async (request, response) => {
	const {
		params: { appealId, correspondenceCategory, folderId, documentId }
	} = request;

	await renderChangeDocumentDetails({
		request,
		response,
		backButtonUrl: `/appeals-service/appeal-details/${appealId}/internal-correspondence/${correspondenceCategory}/manage-documents/${folderId}/${documentId}`
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postChangeDocumentVersionDetails = async (request, response) => {
	const {
		params: { appealId, correspondenceCategory, folderId, documentId }
	} = request;

	await postChangeDocumentDetails({
		request,
		response,
		backButtonUrl: `/appeals-service/appeal-details/${appealId}/internal-correspondence/${correspondenceCategory}/manage-documents/${folderId}/${documentId}`,
		nextPageUrl: `/appeals-service/appeal-details/${appealId}/internal-correspondence/${correspondenceCategory}/manage-documents/${folderId}/${documentId}`
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getDeleteInternalCorrespondenceDocument = async (request, response) => {
	const {
		currentFolder,
		params: { correspondenceCategory }
	} = request;

	if (!currentFolder) {
		return response.status(404).render('app/404.njk');
	}

	await renderDeleteDocument({
		request,
		response,
		backButtonUrl: `/appeals-service/appeal-details/${request.params.appealId}/internal-correspondence/${correspondenceCategory}/manage-documents/${currentFolder.folderId}/{{documentId}}`
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postDeleteInternalCorrespondenceDocument = async (request, response) => {
	const {
		currentAppeal,
		currentFolder,
		params: { correspondenceCategory }
	} = request;

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404.njk');
	}

	await postDeleteDocument({
		request,
		response,
		returnUrl: `/appeals-service/appeal-details/${currentAppeal.appealId}`,
		cancelUrl: `/appeals-service/appeal-details/${currentAppeal.appealId}/internal-correspondence/${correspondenceCategory}/manage-documents/{{folderId}}/{{documentId}}`,
		uploadNewDocumentUrl: `/appeals-service/appeal-details/${currentAppeal.appealId}/internal-correspondence/${correspondenceCategory}/upload-documents/{{folderId}}`
	});
};
