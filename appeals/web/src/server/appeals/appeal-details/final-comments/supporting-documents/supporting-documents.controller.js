import logger from '#lib/logger.js';
import {
	renderDocumentUpload,
	postDocumentUpload,
	renderDocumentDetails,
	postDocumentDetails,
	renderUploadDocumentsCheckAndConfirm,
	postUploadDocumentsCheckAndConfirm
} from '#appeals/appeal-documents/appeal-documents.controller.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { patchRepresentationAttachments } from '#appeals/appeal-details/representations/representations.service.js';

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getAddDocuments = async (request, response) => {
	const {
		currentAppeal,
		params: { finalCommentsType }
	} = request;

	await renderDocumentUpload({
		request,
		response,
		appealDetails: currentAppeal,
		backButtonUrl: `/appeals-service/appeal-details/${currentAppeal.appealId}/final-comments/${finalCommentsType}`,
		nextPageUrl: `/appeals-service/appeal-details/${currentAppeal.appealId}/final-comments/${finalCommentsType}/supporting-documents/add-document-details`
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postAddDocuments = async (request, response) => {
	const {
		currentAppeal,
		params: { finalCommentsType }
	} = request;

	await postDocumentUpload({
		request,
		response,
		nextPageUrl: `/appeals-service/appeal-details/${currentAppeal.appealId}/final-comments/${finalCommentsType}/supporting-documents/add-document-details`
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getAddDocumentDetails = async (request, response) => {
	const {
		currentAppeal,
		params: { finalCommentsType }
	} = request;

	await renderDocumentDetails({
		request,
		response,
		backLinkUrl: `/appeals-service/appeal-details/${currentAppeal.appealId}/final-comments/${finalCommentsType}/supporting-documents/add-documents`
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postAddDocumentDetails = async (request, response) => {
	const {
		currentAppeal,
		params: { finalCommentsType }
	} = request;

	await postDocumentDetails({
		request,
		response,
		backLinkUrl: `/appeals-service/appeal-details/${currentAppeal.appealId}/final-comments/${finalCommentsType}/supporting-documents/add-documents`,
		nextPageUrl: `/appeals-service/appeal-details/${currentAppeal.appealId}/final-comments/${finalCommentsType}/supporting-documents/add-documents/check-your-answers`
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getAddDocumentsCheckAndConfirm = async (request, response) => {
	const {
		currentAppeal,
		params: { finalCommentsType }
	} = request;

	const addDocumentDetailsPageUrl = `/appeals-service/appeal-details/${currentAppeal.appealId}/final-comments/${finalCommentsType}/supporting-documents/add-document-details`;

	await renderUploadDocumentsCheckAndConfirm({
		request,
		response,
		backLinkUrl: addDocumentDetailsPageUrl,
		changeFileLinkUrl: `/appeals-service/appeal-details/${currentAppeal.appealId}/final-comments/${finalCommentsType}/supporting-documents/add-documents`,
		changeDateLinkUrl: addDocumentDetailsPageUrl,
		changeRedactionStatusLinkUrl: addDocumentDetailsPageUrl
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postAddDocumentsCheckAndConfirm = async (request, response) => {
	const {
		currentAppeal,
		currentRepresentation,
		params: { finalCommentsType }
	} = request;

	try {
		await postUploadDocumentsCheckAndConfirm({
			request,
			response,
			nextPageUrl: `/appeals-service/appeal-details/${currentAppeal.appealId}/final-comments/${finalCommentsType}`,
			successCallback: async (
				/** @type {import('@pins/express/types/express.js').Request} */ request,
				/** @type {string[]} */ documentGUIDs
			) => {
				await patchRepresentationAttachments(
					request.apiClient,
					currentAppeal.appealId,
					currentRepresentation.id,
					documentGUIDs
				);

				addNotificationBannerToSession(request.session, 'documentAdded', currentAppeal.appealId);
			}
		});
	} catch (error) {
		logger.error(
			error,
			error instanceof Error
				? error.message
				: 'Something went wrong when adding final comment supporting documents'
		);

		return response.render('app/500.njk');
	}
};
