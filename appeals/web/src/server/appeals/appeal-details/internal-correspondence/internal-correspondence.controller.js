import {
	renderDocumentUpload,
	postDocumentUpload,
	renderDocumentDetails,
	postDocumentDetails,
	renderUploadDocumentsCheckAndConfirm,
	postUploadDocumentsCheckAndConfirm,
	postUploadDocumentVersionCheckAndConfirm,
	renderManageFolder,
	renderManageDocument,
	renderChangeDocumentDetails,
	postChangeDocumentDetails,
	renderDeleteDocument,
	postDeleteDocument
} from '#appeals/appeal-documents/appeal-documents.controller.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { capitalize } from 'lodash-es';
import logger from '#lib/logger.js';

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

	if (correspondenceCategory !== 'cross-team' && correspondenceCategory !== 'inspector') {
		return response.status(500).render('app/500.njk');
	}

	renderDocumentUpload(
		request,
		response,
		currentAppeal,
		`/appeals-service/appeal-details/${currentAppeal.appealId}`,
		`/appeals-service/appeal-details/${currentAppeal.appealId}/internal-correspondence/${correspondenceCategory}/add-document-details/${currentFolder.folderId}`,
		false,
		`Upload ${correspondenceCategory} correspondence`,
		[]
	);
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postDocumentUploadPage = async (request, response) => {
	const {
		currentAppeal,
		currentFolder,
		params: { correspondenceCategory }
	} = request;

	postDocumentUpload(
		request,
		response,
		`/appeals-service/appeal-details/${currentAppeal.appealId}/internal-correspondence/${correspondenceCategory}/add-document-details/${currentFolder.folderId}`
	);
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getDocumentVersionUpload = async (request, response) => {
	const {
		currentAppeal,
		currentFolder,
		params: { correspondenceCategory, documentId }
	} = request;

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404.njk');
	}

	renderDocumentUpload(
		request,
		response,
		currentAppeal,
		`/appeals-service/appeal-details/${currentAppeal.appealId}/internal-correspondence/${correspondenceCategory}/manage-documents/${currentFolder.folderId}/${documentId}`,
		`/appeals-service/appeal-details/${currentAppeal.appealId}/internal-correspondence/${correspondenceCategory}/add-document-details/${currentFolder.folderId}/${documentId}`,
		false,
		undefined,
		[],
		false
	);
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

	postDocumentUpload(
		request,
		response,
		`/appeals-service/appeal-details/${currentAppeal.appealId}/internal-correspondence/${correspondenceCategory}/add-document-details/${currentFolder.folderId}/${documentId}`
	);
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

	renderDocumentDetails(
		request,
		response,
		`/appeals-service/appeal-details/${
			currentAppeal.appealId
		}/internal-correspondence/${correspondenceCategory}/upload-documents/${
			currentFolder?.folderId
		}${documentId ? `/${documentId}` : ''}`,
		false,
		`${capitalize(correspondenceCategory)} correspondence`
	);
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

	postDocumentDetails(
		request,
		response,
		`/appeals-service/appeal-details/${currentAppeal.appealId}/internal-correspondence/${correspondenceCategory}/upload-documents/${currentFolder?.folderId}`,
		`/appeals-service/appeal-details/${
			currentAppeal.appealId
		}/internal-correspondence/${correspondenceCategory}/check-your-answers/${
			currentFolder?.folderId
		}${documentId ? `/${documentId}` : ''}`,
		`${capitalize(correspondenceCategory)} correspondence`
	);
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

	renderUploadDocumentsCheckAndConfirm(
		request,
		response,
		`/appeals-service/appeal-details/${
			currentAppeal.appealId
		}/internal-correspondence/${correspondenceCategory}/add-document-details/${
			currentFolder.folderId
		}${documentId ? `/${documentId}` : ''}`
	);
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postAddDocumentsCheckAndConfirm = async (request, response) => {
	const {
		currentAppeal,
		session,
		params: { correspondenceCategory }
	} = request;

	if (!currentAppeal) {
		return response.status(404).render('app/404');
	}

	try {
		postUploadDocumentsCheckAndConfirm(
			request,
			response,
			`/appeals-service/appeal-details/${currentAppeal.appealId}`,
			() => {
				addNotificationBannerToSession(
					session,
					'internalCorrespondenceDocumentAdded',
					currentAppeal.appealId,
					'',
					`${capitalize(correspondenceCategory)} correspondence documents uploaded`
				);
			}
		);
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
		postUploadDocumentVersionCheckAndConfirm(
			request,
			response,
			`/appeals-service/appeal-details/${currentAppeal.appealId}`
		);
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

	renderManageFolder(
		request,
		response,
		`/appeals-service/appeal-details/${currentAppeal.appealId}`,
		`/appeals-service/appeal-details/${currentAppeal.appealId}/internal-correspondence/${correspondenceCategory}/manage-documents/${currentFolder.folderId}/{{documentId}}`,
		`${capitalize(correspondenceCategory)} correspondence documents`
	);
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

	renderManageDocument(
		request,
		response,
		`/appeals-service/appeal-details/${currentAppeal.appealId}/internal-correspondence/${correspondenceCategory}/manage-documents/${currentFolder.folderId}`,
		`/appeals-service/appeal-details/${currentAppeal.appealId}/internal-correspondence/${correspondenceCategory}/upload-documents/${currentFolder?.folderId}/{{documentId}}`,
		`/appeals-service/appeal-details/${currentAppeal.appealId}/internal-correspondence/${correspondenceCategory}/manage-documents/${currentFolder.folderId}/{{documentId}}/{{versionId}}/delete`
	);
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getChangeDocumentVersionDetails = async (request, response) => {
	const {
		params: { appealId, correspondenceCategory, folderId, documentId }
	} = request;

	renderChangeDocumentDetails(
		request,
		response,
		`/appeals-service/appeal-details/${appealId}/internal-correspondence/${correspondenceCategory}/manage-documents/${folderId}/${documentId}`
	);
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postChangeDocumentVersionDetails = async (request, response) => {
	const {
		params: { appealId, correspondenceCategory, folderId, documentId }
	} = request;

	postChangeDocumentDetails(
		request,
		response,
		`/appeals-service/appeal-details/${appealId}/internal-correspondence/${correspondenceCategory}/manage-documents/${folderId}/${documentId}`,
		`/appeals-service/appeal-details/${appealId}/internal-correspondence/${correspondenceCategory}/manage-documents/${folderId}/${documentId}`
	);
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

	renderDeleteDocument(
		request,
		response,
		`/appeals-service/appeal-details/${request.params.appealId}/internal-correspondence/${correspondenceCategory}/manage-documents/${currentFolder.folderId}/{{documentId}}`
	);
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

	postDeleteDocument(
		request,
		response,
		`/appeals-service/appeal-details/${currentAppeal.appealId}`,
		`/appeals-service/appeal-details/${currentAppeal.appealId}/internal-correspondence/${correspondenceCategory}/manage-documents/{{folderId}}/{{documentId}}`,
		`/appeals-service/appeal-details/${currentAppeal.appealId}/internal-correspondence/${correspondenceCategory}/select-document-type/{{folderId}}`
	);
};
