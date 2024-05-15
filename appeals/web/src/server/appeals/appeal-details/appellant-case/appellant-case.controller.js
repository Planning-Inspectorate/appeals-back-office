import logger from '#lib/logger.js';
import * as appellantCaseService from './appellant-case.service.js';
import {
	appellantCasePage,
	mapWebReviewOutcomeToApiReviewOutcome,
	checkAndConfirmPage,
	getValidationOutcomeFromAppellantCase,
	addDocumentsCheckAndConfirmPage
} from './appellant-case.mapper.js';
import { objectContainsAllKeys } from '#lib/object-utilities.js';
import {
	postChangeDocumentDetails,
	postDocumentDelete,
	postDocumentDetails,
	renderChangeDocumentDetails,
	renderDeleteDocument,
	renderDocumentDetails,
	renderDocumentUpload,
	renderManageDocument,
	renderManageFolder
} from '../../appeal-documents/appeal-documents.controller.js';
import { createNewDocument } from '#app/components/file-uploader.component.js';
import { isFileUploadInfo } from '#lib/ts-utilities.js';
import config from '@pins/appeals.web/environment/config.js';

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderAppellantCase = async (request, response) => {
	const { errors, currentAppeal } = request;

	if (
		currentAppeal &&
		currentAppeal.appellantCaseId !== null &&
		currentAppeal.appellantCaseId !== undefined
	) {
		const appellantCaseResponse = await appellantCaseService
			.getAppellantCaseFromAppealId(
				request.apiClient,
				currentAppeal.appealId,
				currentAppeal.appellantCaseId
			)
			.catch((error) => logger.error(error));

		const mappedPageContent = await appellantCasePage(
			appellantCaseResponse,
			currentAppeal,
			request.originalUrl,
			request.session,
			request.apiClient
		);

		return response.render('patterns/display-page.pattern.njk', {
			pageContent: mappedPageContent,
			errors
		});
	}

	return response.render('app/404.njk');
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderCheckAndConfirm = async (request, response) => {
	try {
		if (!objectContainsAllKeys(request.session, 'webAppellantCaseReviewOutcome')) {
			return response.render('app/500.njk');
		}

		const {
			currentAppeal,
			session: { webAppellantCaseReviewOutcome }
		} = request;

		const reasonOptions =
			await appellantCaseService.getAppellantCaseNotValidReasonOptionsForOutcome(
				request.apiClient,
				webAppellantCaseReviewOutcome.validationOutcome
			);
		if (!reasonOptions) {
			throw new Error('error retrieving invalid reason options');
		}

		const mappedPageContent = checkAndConfirmPage(
			currentAppeal.appealId,
			currentAppeal.appealReference,
			reasonOptions,
			webAppellantCaseReviewOutcome.validationOutcome,
			request.session,
			webAppellantCaseReviewOutcome.reasons,
			webAppellantCaseReviewOutcome.reasonsText,
			webAppellantCaseReviewOutcome.updatedDueDate
		);

		return response.render('patterns/check-and-confirm-page.pattern.njk', {
			pageContent: mappedPageContent
		});
	} catch (error) {
		logger.error(
			error,
			error instanceof Error
				? error.message
				: 'Something went wrong when completing appellant case review'
		);

		return response.render('app/500.njk');
	}
};

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getAppellantCase = async (request, response) => {
	renderAppellantCase(request, response);
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postAppellantCase = async (request, response) => {
	const {
		body: { reviewOutcome },
		errors,
		currentAppeal
	} = request;

	if (errors) {
		return renderAppellantCase(request, response);
	}

	try {
		if (
			currentAppeal &&
			currentAppeal.appellantCaseId !== null &&
			currentAppeal.appellantCaseId !== undefined
		) {
			if (reviewOutcome === 'valid') {
				return response.redirect(
					`/appeals-service/appeal-details/${currentAppeal.appealId}/appellant-case/${reviewOutcome}/date`
				);
			} else {
				return response.redirect(
					`/appeals-service/appeal-details/${currentAppeal.appealId}/appellant-case/${reviewOutcome}`
				);
			}
		}

		return response.render('app/404.njk');
	} catch (error) {
		logger.error(
			error,
			error instanceof Error
				? error.message
				: 'Something went wrong when completing appellant case review'
		);

		return response.render('app/500.njk');
	}
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getCheckAndConfirm = async (request, response) => {
	renderCheckAndConfirm(request, response);
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postCheckAndConfirm = async (request, response) => {
	if (!objectContainsAllKeys(request.session, 'webAppellantCaseReviewOutcome')) {
		return response.render('app/500.njk');
	}

	try {
		const {
			currentAppeal,
			params: { appealId },
			session: { webAppellantCaseReviewOutcome }
		} = request;

		await appellantCaseService.setReviewOutcomeForAppellantCase(
			request.apiClient,
			appealId,
			currentAppeal.appellantCaseId,
			mapWebReviewOutcomeToApiReviewOutcome(
				webAppellantCaseReviewOutcome.validationOutcome,
				webAppellantCaseReviewOutcome.reasons,
				webAppellantCaseReviewOutcome.reasonsText,
				webAppellantCaseReviewOutcome.updatedDueDate
			)
		);

		const validationOutcome = webAppellantCaseReviewOutcome.validationOutcome;

		delete request.session.webAppellantCaseReviewOutcome;

		if (validationOutcome === 'invalid' || validationOutcome === 'incomplete') {
			return response.redirect(
				`/appeals-service/appeal-details/${appealId}/appellant-case/${validationOutcome}/confirmation`
			);
		} else {
			return response.render('app/500.njk');
		}
	} catch (error) {
		logger.error(
			error,
			error instanceof Error
				? error.message
				: 'Something went wrong when completing appellant case review'
		);

		return response.render('app/500.njk');
	}
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getAddDocuments = async (request, response) => {
	const { currentAppeal } = request;

	if (!currentAppeal) {
		return response.status(404).render('app/404');
	}

	const appellantCaseDetails = await getAppellantCaseDetails(request, response, currentAppeal);
	if (!appellantCaseDetails) {
		return response.status(404).render('app/404');
	}

	renderDocumentUpload(
		request,
		response,
		currentAppeal,
		`/appeals-service/appeal-details/${request.params.appealId}/appellant-case/`,
		`/appeals-service/appeal-details/${request.params.appealId}/appellant-case/add-document-details/{{folderId}}`,
		getValidationOutcomeFromAppellantCase(appellantCaseDetails) === 'valid'
	);
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postAddDocuments = async (request, response) => {
	const { body, currentAppeal, currentFolder } = request;

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404');
	}

	if (!body['upload-info']) {
		return response.status(500).render('app/500');
	}

	/** @type {import('./appellant-case.mapper.js').FileUploadInfoItem[]} */
	const uploadInfo = JSON.parse(body['upload-info']);

	if (!isFileUploadInfo(uploadInfo)) {
		return response.status(500).render('app/500');
	}

	request.session.fileUploadInfo = uploadInfo;

	response.redirect(
		`/appeals-service/appeal-details/${request.currentAppeal.appealId}/appellant-case/add-documents/${currentFolder.id}/check-your-answers`
	);
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getAddDocumentsCheckAndConfirm = async (request, response) => {
	const { currentAppeal, currentFolder } = request;

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404');
	}

	if (!objectContainsAllKeys(request.session, 'fileUploadInfo')) {
		return response.render('app/500.njk');
	}

	const mappedPageContent = addDocumentsCheckAndConfirmPage(
		currentAppeal.appealId,
		currentAppeal.appealReference,
		currentFolder.id,
		request.session.fileUploadInfo
	);

	return response.render('patterns/check-and-confirm-page.pattern.njk', {
		pageContent: mappedPageContent
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postAddDocumentsCheckAndConfirm = async (request, response) => {
	const { currentAppeal, currentFolder } = request;

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404');
	}

	if (!objectContainsAllKeys(request.session, 'fileUploadInfo')) {
		return response.render('app/500.njk');
	}

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
			documents: fileUploadInfo.map(
				(/** @type {import('./appellant-case.mapper.js').FileUploadInfoItem} */ document) => {
					/** @type {import('@pins/appeals/index.js').MappedDocument} */
					const mappedDocument = {
						caseId: currentAppeal.appealId,
						documentName: document.name,
						documentType: document.documentType,
						mimeType: document.mimeType,
						documentSize: document.size,
						stage: document.stage,
						fileRowId: document.fileRowId,
						folderId: currentFolder.id,
						GUID: document.GUID
					};

					return mappedDocument;
				}
			)
		};

		await createNewDocument(request.apiClient, currentAppeal.appealId, addDocumentsRequestPayload);

		delete request.session.fileUploadInfo;

		return response.redirect(
			`/appeals-service/appeal-details/${currentAppeal.appealId}/appellant-case`
		);
	} catch (error) {
		logger.error(
			error,
			error instanceof Error
				? error.message
				: 'Something went wrong when completing appellant case review'
		);

		return response.render('app/500.njk');
	}
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getAddDocumentDetails = async (request, response) => {
	const { currentAppeal } = request;

	if (!currentAppeal) {
		return response.status(404).render('app/404');
	}

	const appellantCaseDetails = await getAppellantCaseDetails(request, response, currentAppeal);
	if (!appellantCaseDetails) {
		return response.status(404).render('app/404');
	}

	renderDocumentDetails(
		request,
		response,
		`/appeals-service/appeal-details/${request.params.appealId}/appellant-case/add-documents/{{folderId}}`,
		getValidationOutcomeFromAppellantCase(appellantCaseDetails) === 'valid'
	);
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postAddDocumentDetails = async (request, response) => {
	postDocumentDetails(
		request,
		response,
		`/appeals-service/appeal-details/${request.params.appealId}/appellant-case/add-documents/{{folderId}}`,
		`/appeals-service/appeal-details/${request.params.appealId}/appellant-case/`
	);
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getManageFolder = async (request, response) => {
	renderManageFolder(
		request,
		response,
		`/appeals-service/appeal-details/${request.params.appealId}/appellant-case/`,
		`/appeals-service/appeal-details/${request.params.appealId}/appellant-case/manage-documents/{{folderId}}/{{documentId}}`
	);
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getManageDocument = async (request, response) => {
	renderManageDocument(
		request,
		response,
		`/appeals-service/appeal-details/${request.params.appealId}/appellant-case/manage-documents/{{folderId}}`,
		`/appeals-service/appeal-details/${request.params.appealId}/appellant-case/add-documents/{{folderId}}/{{documentId}}`,
		`/appeals-service/appeal-details/${request.params.appealId}/appellant-case/manage-documents/{{folderId}}/{{documentId}}/{{versionId}}/delete`
	);
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getAddDocumentsVersion = async (request, response) => {
	const { currentAppeal } = request;

	if (!currentAppeal) {
		return response.status(404).render('app/404');
	}

	const appellantCaseDetails = await getAppellantCaseDetails(request, response, currentAppeal);
	if (!appellantCaseDetails) {
		return response.status(404).render('app/404');
	}

	renderDocumentUpload(
		request,
		response,
		currentAppeal,
		`/appeals-service/appeal-details/${request.params.appealId}/appellant-case/manage-documents/${request.params.folderId}/${request.params.documentId}`,
		`/appeals-service/appeal-details/${request.params.appealId}/appellant-case/add-document-details/${request.params.folderId}/${request.params.documentId}`,
		getValidationOutcomeFromAppellantCase(appellantCaseDetails) === 'valid'
	);
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getAddDocumentVersionDetails = async (request, response) => {
	const { currentAppeal } = request;

	if (!currentAppeal) {
		return response.status(404).render('app/404');
	}

	const appellantCaseDetails = await getAppellantCaseDetails(request, response, currentAppeal);
	if (!appellantCaseDetails) {
		return response.status(404).render('app/404');
	}

	renderDocumentDetails(
		request,
		response,
		`/appeals-service/appeal-details/${request.params.appealId}/appellant-case/add-documents/${request.params.folderId}/${request.params.documentId}`,
		getValidationOutcomeFromAppellantCase(appellantCaseDetails) === 'valid'
	);
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postDocumentVersionDetails = async (request, response) => {
	postDocumentDetails(
		request,
		response,
		`/appeals-service/appeal-details/${request.params.appealId}/appellant-case/add-documents/${request.params.folderId}/${request.params.documentId}`,
		`/appeals-service/appeal-details/${request.params.appealId}/appellant-case`
	);
};
/** @type {import('@pins/express').RequestHandler<Response>} */
export const getChangeDocumentVersionDetails = async (request, response) => {
	renderChangeDocumentDetails(
		request,
		response,
		`/appeals-service/appeal-details/${request.params.appealId}/appellant-case/manage-documents/${request.params.folderId}/${request.params.documentId}`
	);
};
/** @type {import('@pins/express').RequestHandler<Response>} */
export const postChangeDocumentVersionDetails = async (request, response) => {
	postChangeDocumentDetails(
		request,
		response,
		`/appeals-service/appeal-details/${request.params.appealId}/appellant-case/manage-documents/${request.params.folderId}/${request.params.documentId}`,
		`/appeals-service/appeal-details/${request.params.appealId}/appellant-case/manage-documents/${request.params.folderId}/${request.params.documentId}`
	);
};
/** @type {import('@pins/express').RequestHandler<Response>} */
export const getDeleteDocument = async (request, response) => {
	renderDeleteDocument(
		request,
		response,
		`/appeals-service/appeal-details/${request.params.appealId}/appellant-case/manage-documents/{{folderId}}`
	);
};
/** @type {import('@pins/express').RequestHandler<Response>} */
export const postDeleteDocument = async (request, response) => {
	postDocumentDelete(
		request,
		response,
		`/appeals-service/appeal-details/${request.params.appealId}/appellant-case`,
		`/appeals-service/appeal-details/${request.params.appealId}/appellant-case/add-documents/{{folderId}}`
	);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * @param {import('../appeal-details.types.js').WebAppeal} appealDetails
 * @returns {Promise<void|import('@pins/appeals.api').Appeals.SingleAppellantCaseResponse>}
 */
async function getAppellantCaseDetails(request, response, appealDetails) {
	if (appealDetails.appellantCaseId === null || appealDetails.appellantCaseId === undefined) {
		return;
	}

	return await appellantCaseService
		.getAppellantCaseFromAppealId(
			request.apiClient,
			appealDetails.appealId,
			appealDetails.appellantCaseId
		)
		.catch((error) => logger.error(error));
}
