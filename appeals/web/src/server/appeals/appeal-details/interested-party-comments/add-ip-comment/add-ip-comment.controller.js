import { postDocumentUpload } from '#appeals/appeal-documents/appeal-documents.controller.js';
import {
	checkAddressPage,
	ipAddressPage,
	ipDetailsPage,
	redactionStatusPage,
	uploadPage,
	dateSubmittedPage
} from './add-ip-comment.mapper.js';
import { getAttachmentsFolder } from './add-ip-comment.service.js';

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export async function renderIpDetails(request, response) {
	const pageContent = ipDetailsPage(request.currentAppeal, request.body, request.errors);

	return response.status(request.errors ? 400 : 200).render('patterns/change-page.pattern.njk', {
		errors: request.errors,
		pageContent
	});
}

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export async function renderCheckAddress(request, response) {
	const pageContent = checkAddressPage(request.currentAppeal, request.errors);

	return response
		.status(request.errors ? 400 : 200)
		.render('patterns/check-and-confirm-page.pattern.njk', {
			errors: request.errors,
			pageContent
		});
}

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export async function renderIpAddress(request, response) {
	const pageContent = ipAddressPage(request.currentAppeal, request.body, request.errors);

	return response.status(request.errors ? 400 : 200).render('patterns/change-page.pattern.njk', {
		errors: request.errors,
		pageContent
	});
}

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export async function renderUpload(request, response) {
	const { currentAppeal, errors } = request;
	const providedAddress = request.session.addIpComment?.addressProvided === 'yes';

	const { folderId } = await getAttachmentsFolder(request.apiClient, currentAppeal.appealId);

	const pageContent = uploadPage(currentAppeal, errors, providedAddress, folderId);

	return response
		.status(request.errors ? 400 : 200)
		.render('appeals/documents/document-upload.njk', pageContent);
}

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * */
export async function postUpload(request, response) {
	const { currentAppeal } = request;

	request.currentFolder = await getAttachmentsFolder(request.apiClient, currentAppeal.id);

	await postDocumentUpload({
		request,
		response,
		nextPageUrl: `/appeals-service/appeal-details/${currentAppeal.appealId}/interested-party-comments/add/redaction-status`
	});
}

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export async function renderRedactionStatus(request, response) {
	const pageContent = redactionStatusPage(request.currentAppeal, request.errors);

	return response.status(request.errors ? 400 : 200).render('patterns/change-page.pattern.njk', {
		errors: request.errors,
		pageContent
	});
}

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export async function renderDateSubmitted(request, response) {
	const pageContent = dateSubmittedPage(request.currentAppeal, request.errors, request.body);

	return response.status(request.errors ? 400 : 200).render('patterns/change-page.pattern.njk', {
		errors: request.errors,
		pageContent
	});
}

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export async function postIpDetails(request, response) {
	if (request.errors) {
		return renderIpDetails(request, response);
	}

	request.session.addIpComment = request.body;

	const { currentAppeal } = request;

	return response.redirect(
		`/appeals-service/appeal-details/${currentAppeal.appealId}/interested-party-comments/add/check-address`
	);
}

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export async function postCheckAddress(request, response) {
	if (request.errors) {
		return renderCheckAddress(request, response);
	}

	const { currentAppeal } = request;
	const { addressProvided } = request.body;

	return response.redirect(
		addressProvided === 'yes'
			? `/appeals-service/appeal-details/${currentAppeal.appealId}/interested-party-comments/add/ip-address`
			: `/appeals-service/appeal-details/${currentAppeal.appealId}/interested-party-comments/add/upload`
	);
}

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export async function postIpAddress(request, response) {
	if (request.errors) {
		return renderIpAddress(request, response);
	}

	const { currentAppeal } = request;

	return response.redirect(
		`/appeals-service/appeal-details/${currentAppeal.appealId}/interested-party-comments/add/upload`
	);
}

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export async function postRedactionStatus(request, response) {
	if (request.errors) {
		return renderRedactionStatus(request, response);
	}

	const { currentAppeal } = request;

	return response.redirect(
		`/appeals-service/appeal-details/${currentAppeal.appealId}/interested-party-comments/add/date-submitted`
	);
}

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export async function postDateSubmitted(request, response) {
	if (request.errors) {
		return renderDateSubmitted(request, response);
	}

	const { currentAppeal } = request;

	return response.redirect(
		`/appeals-service/appeal-details/${currentAppeal.appealId}/interested-party-comments`
	);
}

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export async function redirectTopLevel(request, response) {
	const { currentAppeal } = request;

	return response.redirect(
		`/appeals-service/appeal-details/${currentAppeal.appealId}/interested-party-comments/add/ip-details`
	);
}
