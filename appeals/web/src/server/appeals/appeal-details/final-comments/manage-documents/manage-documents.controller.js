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

/** @typedef {import("#appeals/appeal-details/appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {import('#appeals/appeal-details/representations/types.js').Representation} Representation */

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getManageFolder = async (request, response) => {
	const {
		currentFolder,
		params: { appealId, finalCommentsType }
	} = request;

	if (!currentFolder) {
		return response.status(404).render('app/404');
	}

	await renderManageFolder({
		request,
		response,
		backLinkUrl: `/appeals-service/appeal-details/${appealId}/final-comments/${finalCommentsType}`,
		viewAndEditUrl: `/appeals-service/appeal-details/${appealId}/final-comments/${finalCommentsType}/manage-documents/{{folderId}}/{{documentId}}`,
		pageHeadingTextOverride: 'Supporting documents',
		dateColumnLabelTextOverride: 'Date submitted'
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getManageDocument = async (request, response) => {
	const {
		params: { appealId, finalCommentsType }
	} = request;
	await renderManageDocument({
		request,
		response,
		backLinkUrl: `/appeals-service/appeal-details/${appealId}/final-comments/${finalCommentsType}/manage-documents/{{folderId}}`,
		uploadUpdatedDocumentUrl: `/appeals-service/appeal-details/${appealId}/final-comments/${finalCommentsType}/add-documents/{{folderId}}/{{documentId}}`,
		removeDocumentUrl: `/appeals-service/appeal-details/${appealId}/final-comments/${finalCommentsType}/manage-documents/{{folderId}}/{{documentId}}/{{versionId}}/delete`,
		pageTitleTextOverride: 'Manage versions',
		dateRowLabelTextOverride: 'Date submitted',
		manageDocumentPageBaseUrl: 'manage-documents/'
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getDeleteDocument = async (request, response) => {
	const {
		params: { finalCommentsType }
	} = request;

	await renderDeleteDocument({
		request,
		response,
		backButtonUrl: `/appeals-service/appeal-details/${request.params.appealId}/final-comments/${finalCommentsType}/manage-documents/{{folderId}}/{{documentId}}`
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getChangeDocumentFileNameDetails = async (request, response) => {
	const {
		params: { finalCommentsType }
	} = request;

	await renderChangeDocumentFileName({
		request,
		response,
		backButtonUrl: `/appeals-service/appeal-details/${request.params.appealId}/final-comments/${finalCommentsType}/manage-documents/${request.params.folderId}/${request.params.documentId}`
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getChangeDocumentVersionDetails = async (request, response) => {
	const {
		params: { finalCommentsType }
	} = request;

	await renderChangeDocumentDetails({
		request,
		response,
		backButtonUrl: `/appeals-service/appeal-details/${request.params.appealId}/final-comments/${finalCommentsType}/manage-documents/${request.params.folderId}/${request.params.documentId}`
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postDeleteDocumentPage = async (request, response) => {
	const {
		params: { finalCommentsType }
	} = request;

	await postDeleteDocument({
		request,
		response,
		returnUrl: `/appeals-service/appeal-details/${request.params.appealId}/final-comments`,
		cancelUrl: `/appeals-service/appeal-details/${request.params.appealId}/final-comments/${finalCommentsType}/manage-documents/{{folderId}}/{{documentId}}`,
		uploadNewDocumentUrl: `/appeals-service/appeal-details/${request.params.appealId}/final-comments/add-documents/{{folderId}}`
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postChangeDocumentFileNameDetails = async (request, response) => {
	const {
		params: { finalCommentsType }
	} = request;

	await postChangeDocumentFileName({
		request,
		response,
		backButtonUrl: `/appeals-service/appeal-details/${request.params.appealId}/final-comments/${finalCommentsType}/manage-documents/${request.params.folderId}/${request.params.documentId}`,
		nextPageUrl: `/appeals-service/appeal-details/${request.params.appealId}/final-comments/${finalCommentsType}/manage-documents/${request.params.folderId}/${request.params.documentId}`
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postChangeDocumentVersionDetails = async (request, response) => {
	const {
		params: { finalCommentsType }
	} = request;

	await postChangeDocumentDetails({
		request,
		response,
		backButtonUrl: `/appeals-service/appeal-details/${request.params.appealId}/final-comments/${finalCommentsType}/manage-documents/${request.params.folderId}/${request.params.documentId}`,
		nextPageUrl: `/appeals-service/appeal-details/${request.params.appealId}/final-comments/${finalCommentsType}/manage-documents/${request.params.folderId}/${request.params.documentId}`
	});
};
