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
		currentRepresentation,
		locals: { pageContent }
	} = request;
	let baseUrl
if(request.path.endsWith('/replace')){
	console.log('Rendering replace document upload page');
	console.log('Appeal', currentAppeal);
	console.log(currentRepresentation);
	 baseUrl = request.baseUrl+'/replace';
} else {
	console.log('Rendering add document upload page');
	 baseUrl = request.baseUrl;
}
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
console.log(baseUrl,'baseUrl');
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
