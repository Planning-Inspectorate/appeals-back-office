import {
	postDocumentUpload,
	renderDocumentUpload
} from '#appeals/appeal-documents/appeal-documents.controller.js';

/** @type {import('@pins/express').RequestHandler<{}>}  */
const get = async (request, response) => {
	const { currentComment, currentAppeal, session } = request;

	return renderDocumentUpload({
		request,
		response,
		appealDetails: currentAppeal,
		backButtonUrl: `/appeals-service/appeal-details/${currentAppeal.appealId}/interested-party-comments/${currentComment.id}`,
		nextPageUrl: `/appeals-service/appeal-details/${currentAppeal.appealId}/interested-party-comments/${currentComment.id}/add-document/redaction-status`,
		pageHeadingTextOverride: 'Upload supporting document',
		allowMultipleFiles: false,
		documentType: session.costsDocumentType
	});
};

/**
 * @type {import('@pins/express/types/express.js').RequestHandler<{}>}
 */
const post = async (request, response) => {
	const { currentAppeal, currentComment } = request;

	await postDocumentUpload({
		request,
		response,
		nextPageUrl: `/appeals-service/appeal-details/${currentAppeal.appealId}/interested-party-comments/${currentComment.id}/add-document/redaction-status`
	});
};

export { get as renderAddDocument, post as postAddDocument };
export { get as renderDateSubmitted, post as postDateSubmitted } from './date-submitted.js';
export { get as renderRedactionStatus, post as postRedactionStatus } from './redaction-status.js';
