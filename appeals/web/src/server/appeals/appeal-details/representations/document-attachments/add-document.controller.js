import {
	postDocumentUpload as postDocumentUploadHelper,
	renderDocumentUpload as renderDocumentUploadHelper
} from '#appeals/appeal-documents/appeal-documents.controller.js';
import { constructUrl } from '#lib/mappers/utils/url.mapper.js';
import { preserveQueryString, stripQueryString } from '#lib/url-utilities.js';

/** @type {import('@pins/express').RequestHandler<{}>}  */
export const renderDocumentUpload = async (request, response) => {
	const { currentAppeal, session, query } = request;

	const baseUrl = request.baseUrl;
	const representationBaseUrl = request.baseUrl.replace('/add-document', '');

	const backButtonUrl =
		stripQueryString(String(request.query.editEntrypoint)) === stripQueryString(request.originalUrl)
			? preserveQueryString(request, `${baseUrl}/check-your-answers`, {
					exclude: ['editEntrypoint']
			  })
			: query.backUrl
			? constructUrl(String(query.backUrl), currentAppeal.appealId)
			: representationBaseUrl;

	return renderDocumentUploadHelper({
		request,
		response,
		appealDetails: currentAppeal,
		backButtonUrl,
		nextPageUrl: `${baseUrl}/redaction-status`,
		pageHeadingTextOverride: 'Upload supporting document',
		allowMultipleFiles: false,
		documentType: session.costsDocumentType
	});
};

/**
 * @type {import('@pins/express/types/express.js').RequestHandler<{}>}
 */
export const postDocumentUpload = async (request, response) => {
	const baseUrl = request.baseUrl;

	await postDocumentUploadHelper({
		request,
		response,
		nextPageUrl: `${baseUrl}/redaction-status`
	});
};

export * from './controller/date-submitted.js';
export { postRedactionStatus, renderRedactionStatus } from './controller/redaction-status.js';
