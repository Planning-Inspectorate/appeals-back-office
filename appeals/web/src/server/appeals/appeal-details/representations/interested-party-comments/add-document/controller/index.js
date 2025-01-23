import {
	postDocumentUpload as postDocumentUploadHelper,
	renderDocumentUpload as renderDocumentUploadHelper
} from '#appeals/appeal-documents/appeal-documents.controller.js';

/** @type {import('@pins/express').RequestHandler<{}>}  */
export const renderDocumentUpload = async (request, response) => {
	const { currentRepresentation, currentAppeal, session } = request;

	return renderDocumentUploadHelper({
		request,
		response,
		appealDetails: currentAppeal,
		backButtonUrl: `/appeals-service/appeal-details/${currentAppeal.appealId}/interested-party-comments/${currentRepresentation.id}/review`,
		nextPageUrl: `/appeals-service/appeal-details/${currentAppeal.appealId}/interested-party-comments/${currentRepresentation.id}/add-document/redaction-status`,
		pageHeadingTextOverride: 'Upload supporting document',
		allowMultipleFiles: false,
		documentType: session.costsDocumentType
	});
};

/**
 * @type {import('@pins/express/types/express.js').RequestHandler<{}>}
 */
export const postDocumentUpload = async (request, response) => {
	const { currentAppeal, currentRepresentation } = request;

	await postDocumentUploadHelper({
		request,
		response,
		nextPageUrl: `/appeals-service/appeal-details/${currentAppeal.appealId}/interested-party-comments/${currentRepresentation.id}/add-document/redaction-status`
	});
};

export * from './date-submitted.js';
export * from './redaction-status.js';
