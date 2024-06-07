import logger from '#lib/logger.js';
import * as appellantCaseService from './appellant-case.service.js';
import {
	appellantCasePage,
	mapWebReviewOutcomeToApiReviewOutcome,
	checkAndConfirmPage,
	getValidationOutcomeFromAppellantCase
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

		return response.status(200).render('patterns/display-page.pattern.njk', {
			pageContent: mappedPageContent,
			errors
		});
	}

	return response.status(404).render('app/404.njk');
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderCheckAndConfirm = async (request, response) => {
	try {
		if (!objectContainsAllKeys(request.session, 'webAppellantCaseReviewOutcome')) {
			return response.status(500).render('app/500.njk');
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

		return response.status(200).render('patterns/check-and-confirm-page.pattern.njk', {
			pageContent: mappedPageContent
		});
	} catch (error) {
		logger.error(
			error,
			error instanceof Error
				? error.message
				: 'Something went wrong when completing appellant case review'
		);

		return response.status(500).render('app/500.njk');
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

		return response.status(404).render('app/404.njk');
	} catch (error) {
		logger.error(
			error,
			error instanceof Error
				? error.message
				: 'Something went wrong when completing appellant case review'
		);

		return response.status(500).render('app/500.njk');
	}
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getCheckAndConfirm = async (request, response) => {
	renderCheckAndConfirm(request, response);
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postCheckAndConfirm = async (request, response) => {
	if (!objectContainsAllKeys(request.session, 'webAppellantCaseReviewOutcome')) {
		return response.status(500).render('app/500.njk');
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
			return response.status(500).render('app/500.njk');
		}
	} catch (error) {
		logger.error(
			error,
			error instanceof Error
				? error.message
				: 'Something went wrong when completing appellant case review'
		);

		return response.status(500).render('app/500.njk');
	}
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getAddDocuments = async (request, response) => {
	const { currentAppeal } = request;

	if (!currentAppeal) {
		return response.status(404).render('app/404.njk');
	}

	const appellantCaseDetails = await getAppellantCaseDetails(request, response, currentAppeal);
	if (!appellantCaseDetails) {
		return response.status(404).render('app/404.njk');
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
export const getAddDocumentDetails = async (request, response) => {
	const { currentAppeal } = request;

	if (!currentAppeal) {
		return response.status(404).render('app/404.njk');
	}

	const appellantCaseDetails = await getAppellantCaseDetails(request, response, currentAppeal);
	if (!appellantCaseDetails) {
		return response.status(404).render('app/404.njk');
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
		return response.status(404).render('app/404.njk');
	}

	const appellantCaseDetails = await getAppellantCaseDetails(request, response, currentAppeal);
	if (!appellantCaseDetails) {
		return response.status(404).render('app/404.njk');
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
		return response.status(404).render('app/404.njk');
	}

	const appellantCaseDetails = await getAppellantCaseDetails(request, response, currentAppeal);
	if (!appellantCaseDetails) {
		return response.status(404).render('app/404.njk');
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
		`/appeals-service/appeal-details/${request.params.appealId}/appellant-case/manage-documents/{{folderId}}/{{documentId}}`
	);
};
/** @type {import('@pins/express').RequestHandler<Response>} */
export const postDeleteDocument = async (request, response) => {
	postDocumentDelete(
		request,
		response,
		`/appeals-service/appeal-details/${request.params.appealId}/appellant-case`,
		`/appeals-service/appeal-details/${request.params.appealId}/appellant-case/manage-documents/{{folderId}}/{{documentId}}`,
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
