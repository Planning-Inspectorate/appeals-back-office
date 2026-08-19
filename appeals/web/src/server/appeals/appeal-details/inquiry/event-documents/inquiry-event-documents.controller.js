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
import { capitalizeFirstLetter } from '@pins/appeals/utils/string-case.js';
import { APPEAL_DOCUMENT_TYPE } from '@planning-inspectorate/data-model';

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getDocumentUpload = async (request, response) => {
	const { currentAppeal, currentFolder } = request;

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404.njk');
	}

	const uploadPageHeadingText = `Upload inquiry event document`;
	const documentTitle = `inquiry event document`;

	await renderDocumentUpload({
		request,
		response,
		appealDetails: currentAppeal,
		backButtonUrl: `/appeals-service/appeal-details/${currentAppeal.appealId}`,
		documentTitle: documentTitle,
		nextPageUrl: `/appeals-service/appeal-details/${currentAppeal.appealId}/inquiry-event-documents/add-document-details/${currentFolder.folderId}`,
		pageHeadingTextOverride: uploadPageHeadingText,
		documentType: APPEAL_DOCUMENT_TYPE.INQUIRY_POST_EVENT
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postDocumentUploadPage = async (request, response) => {
	const { currentAppeal, currentFolder } = request;

	await postDocumentUpload({
		request,
		response,
		nextPageUrl: `/appeals-service/appeal-details/${currentAppeal.appealId}/inquiry-event-documents/add-document-details/${currentFolder.folderId}`
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getDocumentVersionUpload = async (request, response) => {
	const {
		apiClient,
		currentAppeal,
		currentFolder,
		params: { documentId }
	} = request;

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404.njk');
	}

	const [pageHeading, uploadContainerHeading] = (() => {
		const headingText = `Inquiry event documents`;

		return [capitalizeFirstLetter(headingText), `Upload ${headingText}`];
	})();

	const allowedType = await getDocumentFileType(apiClient, documentId);

	await renderDocumentUpload({
		request,
		response,
		appealDetails: currentAppeal,
		backButtonUrl: `/appeals-service/appeal-details/${currentAppeal.appealId}/inquiry-event-documents/manage-documents/${currentFolder.folderId}/${documentId}`,
		nextPageUrl: `/appeals-service/appeal-details/${currentAppeal.appealId}/inquiry-event-documents/add-document-details/${currentFolder.folderId}/${documentId}`,
		allowMultipleFiles: true,
		allowedTypes: allowedType ? [allowedType] : undefined,
		...(pageHeading &&
			uploadContainerHeading && {
				pageHeadingTextOverride: pageHeading,
				uploadContainerHeadingTextOverride: uploadContainerHeading
			})
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postDocumentVersionUpload = async (request, response) => {
	const {
		currentAppeal,
		currentFolder,
		params: { documentId }
	} = request;

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404');
	}

	await postDocumentUpload({
		request,
		response,
		nextPageUrl: `/appeals-service/appeal-details/${currentAppeal.appealId}/inquiry-event-documents/add-document-details/${currentFolder.folderId}/${documentId}`
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getAddDocumentDetails = async (request, response) => {
	const {
		currentAppeal,
		currentFolder,
		params: { documentId }
	} = request;

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404.njk');
	}

	const categoryLabel = `Inquiry event document`;

	const documentIdFragment = documentId ? `/${documentId}` : '';

	await renderDocumentDetails({
		request,
		response,
		backLinkUrl: `/appeals-service/appeal-details/${currentAppeal.appealId}/inquiry-event-documents/upload-documents/${currentFolder?.folderId}${documentIdFragment}`,
		pageHeadingTextOverride: categoryLabel,
		documentId
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postAddDocumentDetails = async (request, response) => {
	const {
		currentAppeal,
		currentFolder,
		params: { documentId }
	} = request;

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404.njk');
	}

	let categoryLabel = `Inquiry event document`;

	const documentIdFragment = documentId ? `/${documentId}` : '';

	await postDocumentDetails({
		request,
		response,
		backLinkUrl: `/appeals-service/appeal-details/${currentAppeal.appealId}/inquiry-event-documents/upload-documents/${currentFolder?.folderId}`,
		nextPageUrl: `/appeals-service/appeal-details/${currentAppeal.appealId}/inquiry-event-documents/check-your-answers/${currentFolder?.folderId}${documentIdFragment}`,
		pageHeadingTextOverride: categoryLabel
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
		params: { documentId }
	} = request;

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404');
	}

	const addDocumentDetailsPageUrl = `/appeals-service/appeal-details/${
		currentAppeal.appealId
	}/inquiry-event-documents/add-document-details/${currentFolder.folderId}${
		documentId ? `/${documentId}` : ''
	}`;

	await renderUploadDocumentsCheckAndConfirm({
		request,
		response,
		backLinkUrl: addDocumentDetailsPageUrl,
		changeFileLinkUrl: `/appeals-service/appeal-details/${
			request.currentAppeal.appealId
		}/inquiry-event-documents/upload-documents/${currentFolder.folderId}${
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
				: 'Something went wrong when adding inquiry event document'
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
				: 'Something went wrong when adding inquiry event document version'
		);

		return response.status(500).render('app/500.njk');
	}
};

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getManageFolder = async (request, response) => {
	const { currentAppeal, currentFolder } = request;

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404.njk');
	}

	const categoryLabel = `Inquiry event documents`;

	await renderManageFolder({
		request,
		response,
		backLinkUrl: `/appeals-service/appeal-details/${request.params.appealId}`,
		viewAndEditUrl: `/appeals-service/appeal-details/${request.params.appealId}/inquiry-event-documents/manage-documents/${currentFolder.folderId}/{{documentId}}`,
		addButtonUrl: `/appeals-service/appeal-details/${request.params.appealId}/inquiry-event-documents/upload-documents/${currentFolder.folderId}`,
		pageHeadingTextOverride: categoryLabel,
		canShare: true,
		shareAllLinkUrl: `/appeals-service/appeal-details/${request.params.appealId}/inquiry-event-documents/manage-documents/${currentFolder.folderId}/share-all`
	});
};

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getManageDocument = async (request, response) => {
	const { currentAppeal, currentFolder } = request;

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404.njk');
	}

	await renderManageDocument({
		request,
		response,
		backLinkUrl: `/appeals-service/appeal-details/${request.params.appealId}/inquiry-event-documents/manage-documents/${currentFolder.folderId}`,
		uploadUpdatedDocumentUrl: `/appeals-service/appeal-details/${currentAppeal.appealId}/inquiry-event-documents/upload-documents/${currentFolder?.folderId}/{{documentId}}`,
		removeDocumentUrl: `/appeals-service/appeal-details/${request.params.appealId}/inquiry-event-documents/manage-documents/${currentFolder.folderId}/{{documentId}}/{{versionId}}/delete`
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getDeleteInquiryEventDocument = async (request, response) => {
	const { currentFolder } = request;

	if (!currentFolder) {
		return response.status(404).render('app/404.njk');
	}

	await renderDeleteDocument({
		request,
		response,
		backButtonUrl: `/appeals-service/appeal-details/${request.params.appealId}/inquiry-event-documents/manage-documents/${currentFolder.folderId}/{{documentId}}`
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postDeleteInquiryEventDocument = async (request, response) => {
	const { currentAppeal, currentFolder } = request;

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404.njk');
	}

	await postDeleteDocument({
		request,
		response,
		returnUrl: `/appeals-service/appeal-details/${request.params.appealId}`,
		cancelUrl: `/appeals-service/appeal-details/${request.params.appealId}/inquiry-event-documents/manage-documents/{{folderId}}/{{documentId}}`,
		uploadNewDocumentUrl: `/appeals-service/appeal-details/${currentAppeal.appealId}/inquiry-event-documents/upload-documents/{{folderId}}`
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getChangeDocumentFileNameDetails = async (request, response) => {
	await renderChangeDocumentFileName({
		request,
		response,
		backButtonUrl: `/appeals-service/appeal-details/${request.params.appealId}/inquiry-event-documents/manage-documents/${request.params.folderId}/${request.params.documentId}`
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postChangeDocumentFileNameDetails = async (request, response) => {
	await postChangeDocumentFileName({
		request,
		response,
		backButtonUrl: `/appeals-service/appeal-details/${request.params.appealId}/inquiry-event-documents/manage-documents/${request.params.folderId}/${request.params.documentId}`,
		nextPageUrl: `/appeals-service/appeal-details/${request.params.appealId}/inquiry-event-documents/manage-documents/${request.params.folderId}/${request.params.documentId}`
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getChangeDocumentVersionDetails = async (request, response) => {
	await renderChangeDocumentDetails({
		request,
		response,
		backButtonUrl: `/appeals-service/appeal-details/${request.params.appealId}/inquiry-event-documents/manage-documents/${request.params.folderId}/${request.params.documentId}`
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postChangeDocumentVersionDetails = async (request, response) => {
	await postChangeDocumentDetails({
		request,
		response,
		backButtonUrl: `/appeals-service/appeal-details/${request.params.appealId}/inquiry-event-documents/manage-documents/${request.params.folderId}/${request.params.documentId}`,
		nextPageUrl: `/appeals-service/appeal-details/${request.params.appealId}/inquiry-event-documents/manage-documents/${request.params.folderId}/${request.params.documentId}`
	});
};
