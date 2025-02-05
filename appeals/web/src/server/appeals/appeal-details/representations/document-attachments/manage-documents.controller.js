import {
	postChangeDocumentDetails,
	postChangeDocumentFileName,
	postDeleteDocument,
	renderChangeDocumentDetails,
	renderChangeDocumentFileName,
	renderDeleteDocument,
	renderManageDocument,
	renderManageFolder
} from '#appeals/appeal-documents/appeal-documents.controller.js';

/** @typedef {import("../../appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {import('#appeals/appeal-details/representations/types.js').Representation} Representation */

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getManageFolder = async (request, response) => {
	const { currentFolder } = request;
	const baseUrl = request.baseUrl;
	const backLinkUrl = request.originalUrl.split('/').slice(0, -2).join('/');

	if (!currentFolder) {
		return response.status(404).render('app/404');
	}

	await renderManageFolder({
		request,
		response,
		backLinkUrl: backLinkUrl,
		viewAndEditUrl: `${baseUrl}/{{folderId}}/{{documentId}}`,
		pageHeadingTextOverride: 'Supporting documents',
		dateColumnLabelTextOverride: 'Date submitted'
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getManageDocument = async (request, response) => {
	const {
		params: { appealId, finalCommentsType }
	} = request;
	const baseUrl = request.baseUrl;

	await renderManageDocument({
		request,
		response,
		backLinkUrl: `${baseUrl}/{{folderId}}`,
		uploadUpdatedDocumentUrl: `/appeals-service/appeal-details/${appealId}/final-comments/${finalCommentsType}/add-documents/{{folderId}}/{{documentId}}`,
		removeDocumentUrl: `${baseUrl}/manage-documents/{{folderId}}/{{documentId}}/{{versionId}}/delete`,
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
		backButtonUrl: `${baseUrl}/manage-documents/{{folderId}}/{{documentId}}`
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

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postDeleteDocumentPage = async (request, response) => {
	const baseUrl = request.baseUrl;

	await postDeleteDocument({
		request,
		response,
		returnUrl: `${baseUrl}`,
		cancelUrl: `${baseUrl}/manage-documents/{{folderId}}/{{documentId}}`,
		uploadNewDocumentUrl: `/appeals-service/appeal-details/${request.params.appealId}/final-comments/add-documents/{{folderId}}`
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
