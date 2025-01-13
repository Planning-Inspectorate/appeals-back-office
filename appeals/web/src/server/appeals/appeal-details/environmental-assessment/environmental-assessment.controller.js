import {
	postChangeDocumentDetails,
	postChangeDocumentFileName,
	postDeleteDocument,
	postDocumentDetails,
	postDocumentUpload,
	postUploadDocumentsCheckAndConfirm,
	postUploadDocumentVersionCheckAndConfirm,
	renderChangeDocumentDetails,
	renderChangeDocumentFileName,
	renderDeleteDocument,
	renderDocumentDetails,
	renderDocumentUpload,
	renderManageDocument,
	renderManageFolder,
	renderUploadDocumentsCheckAndConfirm
} from '#appeals/appeal-documents/appeal-documents.controller.js';
import { APPEAL_REDACTED_STATUS } from 'pins-data-model';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import logger from '#lib/logger.js';
import { objectContainsAllKeys } from '#lib/object-utilities.js';
import { getDocumentRedactionStatuses } from '#appeals/appeal-documents/appeal.documents.service.js';

/**
 * @param {number|string} appealId
 * @returns {`/appeals-service/appeal-details/${string}`}
 */
const appealUrl = (appealId) => `/appeals-service/appeal-details/${appealId}`;

/**
 * @param {number|string} appealId
 * @returns {`/appeals-service/appeal-details/${string}`}
 */
const environmentalAssessmentUrl = (appealId) => `${appealUrl(appealId)}/environmental-assessment`;

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getDocumentUpload = async (request, response) => {
	const { currentAppeal, currentFolder } = request;

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404.njk');
	}

	const uploadPageHeadingText = 'Upload environmental assessment documents';

	await renderDocumentUpload({
		request,
		response,
		appealDetails: currentAppeal,
		backButtonUrl: appealUrl(currentAppeal.appealId),
		nextPageUrl: `${environmentalAssessmentUrl(currentAppeal.appealId)}/check-your-answers/${
			currentFolder.folderId
		}`,
		pageHeadingTextOverride: uploadPageHeadingText,
		// TODO: APPEAL_DOCUMENT_TYPE.ENVIRONMENTAL_ASSESSMENT needs to be added to "pins-data-model"
		// documentType: APPEAL_DOCUMENT_TYPE.ENVIRONMENTAL_ASSESSMENT
		documentType: 'environmentalAssessment'
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postDocumentUploadPage = async (request, response) => {
	const { currentAppeal, currentFolder } = request;

	if (!currentFolder) {
		return response.status(404).render('app/404');
	}

	await postDocumentUpload({
		request,
		response,
		nextPageUrl: `${environmentalAssessmentUrl(currentAppeal.appealId)}/check-your-answers/${
			currentFolder.folderId
		}`
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getDocumentVersionUpload = async (request, response) => {
	const {
		currentAppeal,
		currentFolder,
		params: { documentId }
	} = request;

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404.njk');
	}

	await renderDocumentUpload({
		request,
		response,
		appealDetails: currentAppeal,
		backButtonUrl: `${environmentalAssessmentUrl(currentAppeal.appealId)}/manage-documents/${
			currentFolder.folderId
		}/${documentId}`,
		nextPageUrl: `${environmentalAssessmentUrl(currentAppeal.appealId)}/check-your-answers/${
			currentFolder.folderId
		}/${documentId}`,
		allowMultipleFiles: false
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postDocumentVersionUpload = async (request, response) => {
	const {
		currentAppeal,
		currentFolder,
		params: { documentId }
	} = request;

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404');
	}

	await postDocumentUpload({
		request,
		response,
		nextPageUrl: `${environmentalAssessmentUrl(currentAppeal.appealId)}/check-your-answers/${
			currentFolder.folderId
		}/${documentId}`
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getAddDocumentDetails = async (request, response) => {
	const {
		currentAppeal,
		currentFolder,
		params: { documentId }
	} = request;

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404.njk');
	}

	const pageHeadingText = 'Environmental assessment documents';

	const documentIdFragment = documentId ? `/${documentId}` : '';

	await renderDocumentDetails({
		request,
		response,
		backLinkUrl: `${environmentalAssessmentUrl(currentAppeal.appealId)}/upload-documents/${
			currentFolder?.folderId
		}${documentIdFragment}`,
		pageHeadingTextOverride: pageHeadingText,
		documentId
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postAddDocumentDetails = async (request, response) => {
	const {
		currentAppeal,
		currentFolder,
		params: { documentId }
	} = request;

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404.njk');
	}

	const pageHeadingText = 'Environmental assessment documents';

	const documentIdFragment = documentId ? `/${documentId}` : '';

	await postDocumentDetails({
		request,
		response,
		backLinkUrl: `${environmentalAssessmentUrl(currentAppeal.appealId)}/upload-documents/${
			currentFolder?.folderId
		}`,
		nextPageUrl: `${environmentalAssessmentUrl(currentAppeal.appealId)}/check-your-answers/${
			currentFolder?.folderId
		}${documentIdFragment}`,
		pageHeadingTextOverride: pageHeadingText
	});
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getAddDocumentsCheckAndConfirm = async (request, response) => {
	const {
		currentAppeal,
		currentFolder,
		params: { documentId }
	} = request;

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404');
	}

	if (!objectContainsAllKeys(request.session, 'fileUploadInfo')) {
		return response.status(500).render('app/500.njk');
	}

	const redactionStatuses = await getDocumentRedactionStatuses(request.apiClient);

	if (!redactionStatuses) {
		return response.status(500).render('app/500.njk');
	}

	const noRedactionStatus = redactionStatuses.find(
		(redactionStatus) => redactionStatus.key === APPEAL_REDACTED_STATUS.NO_REDACTION_REQUIRED
	);

	request.session.fileUploadInfo?.files.forEach(
		(
			/** @type {import('#appeals/appeal-documents/appeal-documents.types').UncommittedFile} */ file
		) => {
			file.redactionStatus = noRedactionStatus?.id;
		}
	);

	const uploadDocumentsPageUrl = `${environmentalAssessmentUrl(
		currentAppeal.appealId
	)}/upload-documents/${currentFolder.folderId}${documentId ? `/${documentId}` : ''}`;

	await renderUploadDocumentsCheckAndConfirm({
		request,
		response,
		backLinkUrl: uploadDocumentsPageUrl,
		changeFileLinkUrl: `${environmentalAssessmentUrl(currentAppeal.appealId)}/upload-documents/${
			currentFolder.folderId
		}${documentId ? `/${documentId}` : ''}`,
		changeDateLinkUrl: undefined,
		changeRedactionStatusLinkUrl: undefined
	});
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postAddDocumentsCheckAndConfirm = async (request, response) => {
	const { currentAppeal, session } = request;

	if (!currentAppeal) {
		return response.status(404).render('app/404');
	}

	try {
		await postUploadDocumentsCheckAndConfirm({
			request,
			response,
			nextPageUrl: appealUrl(currentAppeal.appealId),
			successCallback: () => {
				addNotificationBannerToSession(
					session,
					'environmentalAssessmentDocumentAdded',
					currentAppeal.appealId,
					'',
					`Environmental assessment documents uploaded`
				);
			}
		});
	} catch (error) {
		logger.error(
			error,
			error instanceof Error
				? error.message
				: 'Something went wrong when adding environmental assessment documents'
		);

		return response.status(500).render('app/500.njk');
	}
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postAddDocumentVersionCheckAndConfirm = async (request, response) => {
	const { currentAppeal } = request;

	if (!currentAppeal) {
		return response.status(404).render('app/404');
	}

	try {
		await postUploadDocumentVersionCheckAndConfirm({
			request,
			response,
			nextPageUrl: appealUrl(currentAppeal.appealId)
		});
	} catch (error) {
		logger.error(
			error,
			error instanceof Error
				? error.message
				: 'Something went wrong when adding environmental assessment document version'
		);

		return response.status(500).render('app/500.njk');
	}
};

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getManageFolder = async (request, response) => {
	const { currentAppeal, currentFolder } = request;

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404.njk');
	}

	const pageHeadingText = 'Environmental assessment documents';

	await renderManageFolder({
		request,
		response,
		backLinkUrl: appealUrl(request.params.appealId),
		viewAndEditUrl: `${environmentalAssessmentUrl(request.params.appealId)}/manage-documents/${
			currentFolder.folderId
		}/{{documentId}}`,
		pageHeadingTextOverride: pageHeadingText
	});
};

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getManageDocument = async (request, response) => {
	const { currentAppeal, currentFolder } = request;

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404.njk');
	}

	await renderManageDocument({
		request,
		response,
		backLinkUrl: `${environmentalAssessmentUrl(request.params.appealId)}/manage-documents/${
			currentFolder.folderId
		}`,
		uploadUpdatedDocumentUrl: `${environmentalAssessmentUrl(
			currentAppeal.appealId
		)}/upload-documents/${currentFolder?.folderId}/{{documentId}}`,
		removeDocumentUrl: `${environmentalAssessmentUrl(request.params.appealId)}/manage-documents/${
			currentFolder.folderId
		}/{{documentId}}/{{versionId}}/delete`,
		pageTitleTextOverride: 'Manage environmental assessment document',
		skipChangeDocumentDetails: true
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getDeleteCostsDocument = async (request, response) => {
	const { currentFolder } = request;

	if (!currentFolder) {
		return response.status(404).render('app/404.njk');
	}

	await renderDeleteDocument({
		request,
		response,
		backButtonUrl: `${environmentalAssessmentUrl(request.params.appealId)}/manage-documents/${
			currentFolder.folderId
		}/{{documentId}}`
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postDeleteCostsDocument = async (request, response) => {
	const { currentAppeal, currentFolder } = request;

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404.njk');
	}

	await postDeleteDocument({
		request,
		response,
		returnUrl: appealUrl(request.params.appealId),
		cancelUrl: `${environmentalAssessmentUrl(
			request.params.appealId
		)}/manage-documents/{{folderId}}/{{documentId}}`,
		uploadNewDocumentUrl: `${environmentalAssessmentUrl(
			currentAppeal.appealId
		)}/upload-documents/{{folderId}}`
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getChangeDocumentFileNameDetails = async (request, response) => {
	await renderChangeDocumentFileName({
		request,
		response,
		backButtonUrl: `${environmentalAssessmentUrl(request.params.appealId)}/manage-documents/${
			request.params.folderId
		}/${request.params.documentId}`
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postChangeDocumentFileNameDetails = async (request, response) => {
	await postChangeDocumentFileName({
		request,
		response,
		backButtonUrl: `${environmentalAssessmentUrl(request.params.appealId)}/manage-documents/${
			request.params.folderId
		}/${request.params.documentId}`,
		nextPageUrl: `${environmentalAssessmentUrl(request.params.appealId)}/manage-documents/${
			request.params.folderId
		}/${request.params.documentId}`
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getChangeDocumentVersionDetails = async (request, response) => {
	await renderChangeDocumentDetails({
		request,
		response,
		backButtonUrl: `${environmentalAssessmentUrl(request.params.appealId)}/manage-documents/${
			request.params.folderId
		}/${request.params.documentId}`
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postChangeDocumentVersionDetails = async (request, response) => {
	await postChangeDocumentDetails({
		request,
		response,
		backButtonUrl: `${environmentalAssessmentUrl(request.params.appealId)}/manage-documents/${
			request.params.folderId
		}/${request.params.documentId}`,
		nextPageUrl: `${environmentalAssessmentUrl(request.params.appealId)}/manage-documents/${
			request.params.folderId
		}/${request.params.documentId}`
	});
};
