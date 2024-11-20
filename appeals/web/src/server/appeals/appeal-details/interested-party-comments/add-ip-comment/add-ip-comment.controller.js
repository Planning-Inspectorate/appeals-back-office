import { postDocumentUpload } from '#appeals/appeal-documents/appeal-documents.controller.js';
import logger from '#lib/logger.js';
import {
	postDateSubmittedFactory,
	postRedactionStatusFactory,
	renderDateSubmittedFactory,
	renderRedactionStatusFactory
} from '../common/index.js';
import { ipAddressPage } from '../interested-party-comments.mapper.js';
import { postRepresentationComment } from './add-ip-comment.service.js';
import config from '@pins/appeals.web/environment/config.js';
import { createNewDocument } from '#app/components/file-uploader.component.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import {
	checkAddressPage,
	checkYourAnswersPage,
	ipDetailsPage,
	mapFileUploadInfoToMappedDocuments,
	mapSessionToRepresentationRequest,
	uploadPage
} from './add-ip-comment.mapper.js';
import { getAttachmentsFolder } from '../interested-party-comments.service.js';

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
	const operationType = request.query.editAddress === 'true' ? 'update' : 'add';
	const pageContent = ipAddressPage(
		request.currentAppeal,
		request.body,
		request.errors,
		'add/check-address',
		operationType
	);

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

	request.currentFolder = await getAttachmentsFolder(request.apiClient, currentAppeal.appealId);
	await postDocumentUpload({
		request,
		response,
		nextPageUrl: `/appeals-service/appeal-details/${currentAppeal.appealId}/interested-party-comments/add/redaction-status`
	});
}

export const renderRedactionStatus = renderRedactionStatusFactory({
	getBackLinkUrl: (appealDetails) =>
		`/appeals-service/appeal-details/${appealDetails.appealId}/interested-party-comments/add/upload`
});

export const postRedactionStatus = postRedactionStatusFactory({
	getRedirectUrl: (appealDetails) =>
		`/appeals-service/appeal-details/${appealDetails.appealId}/interested-party-comments/add/date-submitted`,
	errorHandler: renderRedactionStatus
});

export const renderDateSubmitted = renderDateSubmittedFactory({
	getBackLinkUrl: (appealDetails) =>
		`/appeals-service/appeal-details/${appealDetails.appealId}/interested-party-comments/add/redaction-status`
});

export const postDateSubmitted = postDateSubmittedFactory({
	getRedirectUrl: (appealDetails) =>
		`/appeals-service/appeal-details/${appealDetails.appealId}/interested-party-comments/add/check-your-answers`,
	errorHandler: renderDateSubmitted
});

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
export async function postIPComment(request, response) {
	try {
		const { currentAppeal } = request;

		const { folderId } = await getAttachmentsFolder(request.apiClient, currentAppeal.appealId);

		const payload = mapSessionToRepresentationRequest(
			currentAppeal,
			request.session?.addIpComment,
			request.session?.fileUploadInfo
		);

		const addDocumentsRequestPayload = mapFileUploadInfoToMappedDocuments(
			currentAppeal.appealId,
			folderId,
			2,
			config.useBlobEmulator === true ? config.blobEmulatorSasUrl : config.blobStorageUrl,
			config.blobStorageDefaultContainer,
			request.session.fileUploadInfo
		);

		await createNewDocument(request.apiClient, currentAppeal.appealId, addDocumentsRequestPayload);

		await postRepresentationComment(request.apiClient, currentAppeal.appealId, payload);

		delete request.session.addIpComment;
		delete request.session.fileUploadInfo;

		addNotificationBannerToSession(
			request.session,
			'changePage',
			currentAppeal.appealId,
			'',
			'Comment added'
		);

		redirectToIPComments(request, response);
	} catch (error) {
		logger.error(
			error,
			error instanceof Error
				? error.message
				: 'Something went wrong when submitting the add ip comments check and confirm page'
		);
	}
}

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export async function renderCheckYourAnswers(request, response) {
	const pageContent = checkYourAnswersPage(
		request.currentAppeal,
		request.session?.addIpComment,
		request.session?.fileUploadInfo,
		request.errors
	);

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
export async function redirectToAdd(request, response) {
	const { currentAppeal } = request;

	return response.redirect(
		`/appeals-service/appeal-details/${currentAppeal.appealId}/interested-party-comments/add/ip-details`
	);
}

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export async function redirectToIPComments(request, response) {
	const { currentAppeal } = request;

	return response.redirect(
		`/appeals-service/appeal-details/${currentAppeal.appealId}/interested-party-comments`
	);
}
