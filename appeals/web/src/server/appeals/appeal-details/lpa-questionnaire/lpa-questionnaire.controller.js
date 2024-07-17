import * as lpaQuestionnaireService from './lpa-questionnaire.service.js';
import {
	lpaQuestionnairePage,
	checkAndConfirmPage,
	mapWebValidationOutcomeToApiValidationOutcome,
	getValidationOutcomeFromLpaQuestionnaire,
	reviewCompletePage
} from './lpa-questionnaire.mapper.js';
import logger from '#lib/logger.js';
import { objectContainsAllKeys } from '#lib/object-utilities.js';
import {
	renderDocumentUpload,
	renderDocumentDetails,
	postDocumentUpload,
	postDocumentDetails,
	renderUploadDocumentsCheckAndConfirm,
	postUploadDocumentsCheckAndConfirm,
	postUploadDocumentVersionCheckAndConfirm,
	renderManageFolder,
	renderManageDocument,
	renderDeleteDocument,
	renderChangeDocumentDetails,
	postChangeDocumentDetails,
	postDeleteDocument
} from '../../appeal-documents/appeal-documents.controller.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import("@pins/express/types/express.js").ValidationErrors | string | null} errors
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderLpaQuestionnaire = async (request, response, errors = null) => {
	const {
		currentAppeal,
		params: { lpaQuestionnaireId },
		session
	} = request;

	const lpaQuestionnaire = await lpaQuestionnaireService.getLpaQuestionnaireFromId(
		request.apiClient,
		currentAppeal.appealId,
		lpaQuestionnaireId
	);

	if (!lpaQuestionnaire) {
		return response.status(404).render('app/404.njk');
	}

	const mappedPageContent = await lpaQuestionnairePage(
		lpaQuestionnaire,
		currentAppeal,
		request.originalUrl,
		session
	);

	return response.status(200).render('patterns/display-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getLpaQuestionnaire = async (request, response) => {
	renderLpaQuestionnaire(request, response);
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postLpaQuestionnaire = async (request, response) => {
	const {
		params: { appealId, lpaQuestionnaireId },
		body,
		errors,
		apiClient,
		currentAppeal
	} = request;

	if (errors) {
		return renderLpaQuestionnaire(request, response, errors);
	}

	try {
		const reviewOutcome = body['review-outcome'];

		if (currentAppeal) {
			if (reviewOutcome === 'complete') {
				await lpaQuestionnaireService.setReviewOutcomeForLpaQuestionnaire(
					apiClient,
					appealId,
					lpaQuestionnaireId,
					mapWebValidationOutcomeToApiValidationOutcome('complete')
				);
				return response.redirect(
					`/appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}/confirmation`
				);
			} else if (reviewOutcome === 'incomplete') {
				return response.redirect(
					`/appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}/incomplete`
				);
			}
		} else {
			return response.status(500).render('app/500.njk');
		}
	} catch (error) {
		let errorMessage = 'Something went wrong when completing lpa questionnaire review';
		if (error instanceof Error) {
			errorMessage += `: ${error.message}`;
		}

		logger.error(error, errorMessage);

		return renderLpaQuestionnaire(request, response, errorMessage);
	}
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const renderLpaQuestionnaireReviewCompletePage = async (request, response) => {
	const {
		currentAppeal: { appealId, appealReference }
	} = request;
	const pageContent = reviewCompletePage(appealId, appealReference);

	return response.status(200).render('appeals/confirmation.njk', {
		pageContent
	});
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderCheckAndConfirm = async (request, response) => {
	try {
		if (!objectContainsAllKeys(request.session, 'webLPAQuestionnaireReviewOutcome')) {
			return response.status(500).render('app/500.njk');
		}

		const {
			currentAppeal,
			params: { lpaQuestionnaireId },
			session: { webLPAQuestionnaireReviewOutcome }
		} = request;

		const reasonOptions = await lpaQuestionnaireService.getLPAQuestionnaireIncompleteReasonOptions(
			request.apiClient
		);
		if (!reasonOptions) {
			throw new Error('error retrieving invalid reason options');
		}

		const mappedPageContent = checkAndConfirmPage(
			currentAppeal.appealId,
			currentAppeal.appealReference,
			lpaQuestionnaireId,
			reasonOptions,
			'incomplete',
			request.session,
			webLPAQuestionnaireReviewOutcome.reasons,
			webLPAQuestionnaireReviewOutcome.reasonsText,
			webLPAQuestionnaireReviewOutcome.updatedDueDate
		);

		return response.status(200).render('patterns/check-and-confirm-page.pattern.njk', {
			pageContent: mappedPageContent
		});
	} catch (error) {
		logger.error(
			error,
			error instanceof Error
				? error.message
				: 'Something went wrong when completing lpa questionnaire review'
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
	try {
		if (!objectContainsAllKeys(request.session, 'webLPAQuestionnaireReviewOutcome')) {
			return response.status(500).render('app/500.njk');
		}

		const {
			currentAppeal,
			params: { lpaQuestionnaireId },
			session: { webLPAQuestionnaireReviewOutcome }
		} = request;

		await lpaQuestionnaireService.setReviewOutcomeForLpaQuestionnaire(
			request.apiClient,
			currentAppeal.appealId,
			lpaQuestionnaireId,
			mapWebValidationOutcomeToApiValidationOutcome(
				'incomplete',
				webLPAQuestionnaireReviewOutcome.reasons,
				webLPAQuestionnaireReviewOutcome.reasonsText,
				webLPAQuestionnaireReviewOutcome.updatedDueDate
			)
		);

		if (webLPAQuestionnaireReviewOutcome.updatedDueDate) {
			request.session.lpaQuestionnaireUpdatedDueDate =
				webLPAQuestionnaireReviewOutcome.updatedDueDate;
		}

		delete request.session.webLPAQuestionnaireReviewOutcome;

		return response.redirect(
			`/appeals-service/appeal-details/${currentAppeal.appealId}/lpa-questionnaire/${lpaQuestionnaireId}/incomplete/confirmation`
		);
	} catch (error) {
		logger.error(
			error,
			error instanceof Error
				? error.message
				: 'Something went wrong when completing lpa questionnaire review'
		);

		return response.status(500).render('app/500.njk');
	}
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getConfirmation = async (request, response) => {
	renderLpaQuestionnaireReviewCompletePage(request, response);
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getAddDocuments = async (request, response) => {
	const { currentAppeal, currentFolder } = request;
	const lpaQuestionnaireDetails = await getLpaQuestionnaireDetails(request);

	if (!currentAppeal || !currentFolder || !lpaQuestionnaireDetails) {
		return response.status(404).render('app/404.njk');
	}

	const documentType = currentFolder.path.split('/')[1];
	let uploadPageHeadingText = '';

	switch (documentType) {
		case 'siteNotice':
			uploadPageHeadingText = `Upload site notice`;
			break;
		case 'lettersToNeighbours':
			uploadPageHeadingText = `Upload letter or email notification`;
			break;
		case 'pressAdvert':
			uploadPageHeadingText = `Upload press advert notification`;
			break;
		default:
			uploadPageHeadingText = '';
			break;
	}

	await renderDocumentUpload(
		request,
		response,
		currentAppeal,
		`/appeals-service/appeal-details/${request.params.appealId}/lpa-questionnaire/${request.params.lpaQuestionnaireId}`,
		`/appeals-service/appeal-details/${request.params.appealId}/lpa-questionnaire/${request.params.lpaQuestionnaireId}/${request.params.documentType}/add-document-details/{{folderId}}`,
		getValidationOutcomeFromLpaQuestionnaire(lpaQuestionnaireDetails) === 'complete',
		uploadPageHeadingText
	);
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postAddDocuments = async (request, response) => {
	const { currentAppeal, currentFolder } = request;

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404');
	}

	await postDocumentUpload(
		request,
		response,
		`/appeals-service/appeal-details/${currentAppeal.appealId}/lpa-questionnaire/${request.params.lpaQuestionnaireId}/add-document-details/${currentFolder.folderId}`
	);
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getAddDocumentDetails = async (request, response) => {
	const { currentFolder } = request;
	const lpaQuestionnaireDetails = await getLpaQuestionnaireDetails(request);
	if (!currentFolder || !lpaQuestionnaireDetails) {
		return response.status(404).render('app/404.njk');
	}

	const documentType = currentFolder.path.split('/')[1];
	const notificationDocumentTypes = ['siteNotice', 'lettersToNeighbours', 'pressAdvert'];
	const uploadPageHeadingText = notificationDocumentTypes.includes(documentType)
		? 'Notification documents'
		: '';

	await renderDocumentDetails(
		request,
		response,
		`/appeals-service/appeal-details/${request.params.appealId}/lpa-questionnaire/${request.params.lpaQuestionnaireId}/add-documents/{{folderId}}`,
		getValidationOutcomeFromLpaQuestionnaire(lpaQuestionnaireDetails) === 'complete',
		uploadPageHeadingText
	);
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postAddDocumentDetails = async (request, response) => {
	await postDocumentDetails(
		request,
		response,
		`/appeals-service/appeal-details/${request.params.appealId}/lpa-questionnaire/${request.params.lpaQuestionnaireId}/add-documents/{{folderId}}`,
		`/appeals-service/appeal-details/${request.params.appealId}/lpa-questionnaire/${request.params.lpaQuestionnaireId}/add-documents/{{folderId}}/check-your-answers`
	);
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getAddDocumentsCheckAndConfirm = async (request, response) => {
	const {
		currentFolder,
		params: { documentId }
	} = request;

	if (!currentFolder) {
		return response.status(404).render('app/404');
	}

	await renderUploadDocumentsCheckAndConfirm(
		request,
		response,
		`/appeals-service/appeal-details/${request.currentAppeal.appealId}/lpa-questionnaire/${
			request.params.lpaQuestionnaireId
		}/add-document-details/${currentFolder.folderId}${documentId ? `/${documentId}` : ''}`
	);
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postAddDocumentsCheckAndConfirm = async (request, response) => {
	const { currentAppeal } = request;

	if (!currentAppeal) {
		return response.status(404).render('app/404');
	}

	try {
		await postUploadDocumentsCheckAndConfirm(
			request,
			response,
			`/appeals-service/appeal-details/${currentAppeal.appealId}/lpa-questionnaire/${request.params.lpaQuestionnaireId}`
		);
	} catch (error) {
		logger.error(
			error,
			error instanceof Error
				? error.message
				: 'Something went wrong when adding documents to lpa questionnaire'
		);

		return response.render('app/500.njk');
	}
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postAddDocumentVersionCheckAndConfirm = async (request, response) => {
	const { currentAppeal } = request;

	if (!currentAppeal) {
		return response.status(404).render('app/404');
	}

	try {
		await postUploadDocumentVersionCheckAndConfirm(
			request,
			response,
			`/appeals-service/appeal-details/${currentAppeal.appealId}/lpa-questionnaire/${request.params.lpaQuestionnaireId}`
		);
	} catch (error) {
		logger.error(
			error,
			error instanceof Error
				? error.message
				: 'Something went wrong when adding document version to lpa questionnaire'
		);

		return response.render('app/500.njk');
	}
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getManageFolder = async (request, response) => {
	await renderManageFolder(
		request,
		response,
		`/appeals-service/appeal-details/${request.params.appealId}/lpa-questionnaire/${request.params.lpaQuestionnaireId}/`,
		`/appeals-service/appeal-details/${request.params.appealId}/lpa-questionnaire/${request.params.lpaQuestionnaireId}/manage-documents/{{folderId}}/{{documentId}}`
	);
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getManageDocument = async (request, response) => {
	await renderManageDocument(
		request,
		response,
		`/appeals-service/appeal-details/${request.params.appealId}/lpa-questionnaire/${request.params.lpaQuestionnaireId}/manage-documents/{{folderId}}`,
		`/appeals-service/appeal-details/${request.params.appealId}/lpa-questionnaire/${request.params.lpaQuestionnaireId}/add-documents/{{folderId}}/{{documentId}}`,
		`/appeals-service/appeal-details/${request.params.appealId}/lpa-questionnaire/${request.params.lpaQuestionnaireId}/manage-documents/{{folderId}}/{{documentId}}/{{versionId}}/delete`
	);
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getAddDocumentVersion = async (request, response) => {
	const appealDetails = request.currentAppeal;
	const lpaQuestionnaireDetails = await getLpaQuestionnaireDetails(request);
	if (!appealDetails || !lpaQuestionnaireDetails) {
		return response.status(404).render('app/404.njk');
	}

	await renderDocumentUpload(
		request,
		response,
		appealDetails,
		`/appeals-service/appeal-details/${request.params.appealId}/lpa-questionnaire/${request.params.lpaQuestionnaireId}/manage-documents/${request.params.folderId}/${request.params.documentId}`,
		`/appeals-service/appeal-details/${request.params.appealId}/lpa-questionnaire/${request.params.lpaQuestionnaireId}/add-document-details/${request.params.folderId}/${request.params.documentId}`,
		getValidationOutcomeFromLpaQuestionnaire(lpaQuestionnaireDetails) === 'complete'
	);
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postAddDocumentVersion = async (request, response) => {
	const {
		currentAppeal,
		currentFolder,
		params: { documentId }
	} = request;

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404');
	}

	await postDocumentUpload(
		request,
		response,
		`/appeals-service/appeal-details/${currentAppeal.appealId}/lpa-questionnaire/${request.params.lpaQuestionnaireId}/add-document-details/${currentFolder.folderId}/${documentId}`
	);
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getAddDocumentVersionDetails = async (request, response) => {
	const lpaQuestionnaireDetails = await getLpaQuestionnaireDetails(request);
	if (!lpaQuestionnaireDetails) {
		return response.status(404).render('app/404.njk');
	}

	await renderDocumentDetails(
		request,
		response,
		`/appeals-service/appeal-details/${request.params.appealId}/lpa-questionnaire/${request.params.lpaQuestionnaireId}/add-documents/${request.params.folderId}/${request.params.documentId}`,
		getValidationOutcomeFromLpaQuestionnaire(lpaQuestionnaireDetails) === 'complete'
	);
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getChangeDocumentVersionDetails = async (request, response) => {
	await renderChangeDocumentDetails(
		request,
		response,
		`/appeals-service/appeal-details/${request.params.appealId}/lpa-questionnaire/${request.params.lpaQuestionnaireId}/manage-documents/${request.params.folderId}/${request.params.documentId}`
	);
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postDocumentVersionDetails = async (request, response) => {
	await postDocumentDetails(
		request,
		response,
		`/appeals-service/appeal-details/${request.params.appealId}/lpa-questionnaire/${request.params.lpaQuestionnaireId}/add-documents/${request.params.folderId}/${request.params.documentId}`,
		`/appeals-service/appeal-details/${request.params.appealId}/lpa-questionnaire/${request.params.lpaQuestionnaireId}/add-documents/${request.params.folderId}/${request.params.documentId}/check-your-answers`
	);
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postChangeDocumentVersionDetails = async (request, response) => {
	await postChangeDocumentDetails(
		request,
		response,
		`/appeals-service/appeal-details/${request.params.appealId}/lpa-questionnaire/${request.params.lpaQuestionnaireId}/manage-documents/${request.params.folderId}/${request.params.documentId}`,
		`/appeals-service/appeal-details/${request.params.appealId}/lpa-questionnaire/${request.params.lpaQuestionnaireId}/manage-documents/${request.params.folderId}/${request.params.documentId}`
	);
};
/** @type {import('@pins/express').RequestHandler<Response>} */
export const getDeleteDocument = async (request, response) => {
	await renderDeleteDocument(
		request,
		response,
		`/appeals-service/appeal-details/${request.params.appealId}/lpa-questionnaire/${request.params.lpaQuestionnaireId}/manage-documents/{{folderId}}/{{documentId}}`
	);
};
/** @type {import('@pins/express').RequestHandler<Response>} */
export const postDeleteDocumentPage = async (request, response) => {
	await postDeleteDocument(
		request,
		response,
		`/appeals-service/appeal-details/${request.params.appealId}/lpa-questionnaire/${request.params.lpaQuestionnaireId}`,
		`/appeals-service/appeal-details/${request.params.appealId}/lpa-questionnaire/${request.params.lpaQuestionnaireId}/manage-documents/{{folderId}}/{{documentId}}`,
		`/appeals-service/appeal-details/${request.params.appealId}/lpa-questionnaire/${request.params.lpaQuestionnaireId}/add-documents/{{folderId}}`
	);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @returns {Promise<void|import('@pins/appeals.api').Appeals.SingleLPAQuestionnaireResponse>}
 */
async function getLpaQuestionnaireDetails(request) {
	return await lpaQuestionnaireService
		.getLpaQuestionnaireFromId(
			request.apiClient,
			request.params.appealId,
			request.params.lpaQuestionnaireId
		)
		.catch((error) => logger.error(error));
}
