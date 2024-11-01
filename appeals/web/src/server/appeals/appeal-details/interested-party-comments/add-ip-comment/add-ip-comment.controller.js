import { postDocumentUpload } from '#appeals/appeal-documents/appeal-documents.controller.js';
import logger from '#lib/logger.js';
import {
	checkAddressPage,
	ipDetailsPage,
	redactionStatusPage,
	uploadPage,
	dateSubmittedPage,
	checkYourAnswersPage
} from './add-ip-comment.mapper.js';
import { ipAddressPage } from '../interested-party-comments.mapper.js';
import { getAttachmentsFolder, createIPComment } from './add-ip-comment.service.js';
import config from '@pins/appeals.web/environment/config.js';
import { createNewDocument } from '#app/components/file-uploader.component.js';

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
		`/appeals-service/appeal-details/${currentAppeal.appealId}/interested-party-comments/add/check-your-answers`
	);
}

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export async function postIPComment(request, response) {
	const documentGuid = request.session.fileUploadInfo?.files[0].GUID
	const currentFolder = request.session.fileUploadInfo?.folderId

	try {
		const {
			currentAppeal,
			session: { fileUploadInfo }
		} = request;

		/** @type {import('@pins/appeals/index.js').AddDocumentsRequest} */
		const addDocumentsRequestPayload = {
			blobStorageHost:
				config.useBlobEmulator === true ? config.blobEmulatorSasUrl : config.blobStorageUrl,
			blobStorageContainer: config.blobStorageDefaultContainer,
			documents: fileUploadInfo.files.map(
				(/** @type {import('#lib/ts-utilities.js').FileUploadInfoItem} */ document) => {
					/** @type {import('@pins/appeals/index.js').MappedDocument} */
					const mappedDocument = {
						caseId: currentAppeal.appealId,
						documentName: document.name,
						documentType: document.documentType,
						mimeType: document.mimeType,
						documentSize: document.size,
						stage: document.stage,
						folderId: currentFolder,
						GUID: document.GUID,
						receivedDate: document.receivedDate,
						redactionStatusId: document.redactionStatus,
						blobStoragePath: document.blobStoreUrl
					};

					return mappedDocument;
				}
			)
		};

		await createNewDocument(request.apiClient, currentAppeal.appealId, addDocumentsRequestPayload);

		await createIPComment(
			request.session?.addIpComment,
			documentGuid,
			request.apiClient,
			request.currentAppeal.appealId
		);

		delete request.session.fileUploadInfo;

		return response.redirect(
			`/appeals-service/appeal-details/${currentAppeal.appealId}/interested-party-comments`
		);

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
export async function redirectTopLevel(request, response) {
	const { currentAppeal } = request;

	return response.redirect(
		`/appeals-service/appeal-details/${currentAppeal.appealId}/interested-party-comments/add/ip-details`
	);
}
