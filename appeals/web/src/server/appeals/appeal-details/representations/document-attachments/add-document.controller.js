import {
	postDocumentUpload as postDocumentUploadHelper,
	renderDocumentUpload as renderDocumentUploadHelper
} from '#appeals/appeal-documents/appeal-documents.controller.js';
import { isAtEditEntrypoint } from '#lib/edit-utilities.js';
import { constructUrl } from '#lib/mappers/utils/url.mapper.js';
import { preserveQueryString } from '#lib/url-utilities.js';

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const renderDocumentUpload = async (request, response) => {
	const {
		currentAppeal,
		session,
		query,
		locals: { pageContent }
	} = request;

	const baseUrl = request.baseUrl;
	const representationBaseUrl = request.baseUrl.replace('/add-document', '');

	let backButtonUrl = isAtEditEntrypoint(request)
		? preserveQueryString(request, `${baseUrl}/check-your-answers`, {
				exclude: ['editEntrypoint']
		  })
		: query.backUrl
		? constructUrl(String(query.backUrl), currentAppeal.appealId)
		: representationBaseUrl;

	if (session.createRepresentation) {
		const appealDetailsUrlPattern = /^(\/appeals-service\/appeal-details\/[^/]+).*$/;
		backButtonUrl = request.baseUrl.replace(appealDetailsUrlPattern, '$1');
	}

	return renderDocumentUploadHelper({
		request,
		response,
		appealDetails: currentAppeal,
		backButtonUrl,
		nextPageUrl: `${baseUrl}/redaction-status`,
		pageHeadingTextOverride:
			pageContent?.addDocument?.pageHeadingTextOverride || 'Upload supporting document',
		allowMultipleFiles: false,
		documentType: session.costsDocumentType,
		preHeadingTextOverride: pageContent?.pageHeadingTextOverride,
		uploadContainerHeadingTextOverride: pageContent?.addDocument?.uploadContainerHeadingTextOverride
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
