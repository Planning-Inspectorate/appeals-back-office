import logger from '#lib/logger.js';
import {
	getDocumentRedactionStatuses,
	updateDocuments,
	getFileVersionsInfo,
	getFileInfo,
	deleteDocument
} from './appeal.documents.service.js';
import {
	mapDocumentDetailsFormDataToAPIRequest,
	addDocumentDetailsPage,
	manageFolderPage,
	manageDocumentPage,
	mapRedactionStatusIdToName,
	changeDocumentDetailsPage,
	deleteDocumentPage,
	documentUploadPage
} from './appeal-documents.mapper.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { isInternalUrl } from '#lib/url-utilities.js';

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * @param {import('../appeal-details/appeal-details.types.js').WebAppeal} appealDetails
 * @param {string} backButtonUrl
 * @param {string} [nextPageUrl]
 * @param {boolean} [isLateEntry]
 * @param {string} [pageHeadingTextOverride]
 * @param {boolean} [allowMultipleFiles]
 * @param {string} [documentType]
 */
export const renderDocumentUpload = async (
	request,
	response,
	appealDetails,
	backButtonUrl,
	nextPageUrl,
	isLateEntry = false,
	pageHeadingTextOverride,
	allowMultipleFiles = true,
	documentType
) => {
	const {
		currentFolder,
		errors,
		params: { appealId, documentId }
	} = request;

	if (!appealDetails || !currentFolder) {
		return response.status(404).render('app/404');
	}

	let documentName;
	let _documentType = documentType;

	if (documentId) {
		const fileInfo = await getFileInfo(request.apiClient, appealId, documentId);
		documentName = fileInfo?.latestDocumentVersion.fileName;
		_documentType = fileInfo?.latestDocumentVersion.documentType;
	}

	const mappedPageContent = documentUploadPage(
		appealId,
		appealDetails.appealReference,
		`${currentFolder.id}`,
		currentFolder.path,
		documentId,
		documentName,
		backButtonUrl,
		nextPageUrl,
		isLateEntry,
		errors,
		pageHeadingTextOverride,
		allowMultipleFiles,
		_documentType
	);

	return response.render('appeals/documents/document-upload.njk', mappedPageContent);
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * @param {string} backButtonUrl
 * @param {boolean} [isLateEntry]
 * @param {string} [pageHeadingTextOverride]
 */
export const renderDocumentDetails = async (
	request,
	response,
	backButtonUrl,
	isLateEntry = false,
	pageHeadingTextOverride
) => {
	const { currentFolder, body, errors } = request;

	if (!currentFolder) {
		return response.status(404).render('app/404.njk');
	}

	const redactionStatuses = await getDocumentRedactionStatuses(request.apiClient);

	if (!redactionStatuses) {
		return response.render('app/500.njk');
	}

	const mappedPageContent = addDocumentDetailsPage(
		backButtonUrl,
		currentFolder,
		body?.items,
		redactionStatuses,
		pageHeadingTextOverride
	);
	const isAdditionalDocument = currentFolder.path.split('/')[1] === 'additionalDocuments';

	return response.render('appeals/documents/add-document-details.njk', {
		pageContent: mappedPageContent,
		displayLateEntryContent: isAdditionalDocument && isLateEntry,
		errors
	});
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * @param {string} backButtonUrl
 * @param {string} viewAndEditUrl
 * @param {string} [pageHeadingTextOverride]
 */
export const renderManageFolder = async (
	request,
	response,
	backButtonUrl,
	viewAndEditUrl,
	pageHeadingTextOverride
) => {
	const { currentFolder, errors } = request;

	if (!currentFolder) {
		return response.status(404).render('app/404.njk');
	}

	const redactionStatuses = await getDocumentRedactionStatuses(request.apiClient);
	if (!redactionStatuses) {
		return response.render('app/500.njk');
	}

	const mappedPageContent = manageFolderPage(
		backButtonUrl,
		viewAndEditUrl,
		currentFolder,
		redactionStatuses,
		request,
		pageHeadingTextOverride
	);

	return response.render('appeals/documents/manage-folder.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * @param {string} backButtonUrl
 * @param {string} uploadUpdatedDocumentUrl
 * @param {string} removeDocumentUrl
 */
export const renderManageDocument = async (
	request,
	response,
	backButtonUrl,
	uploadUpdatedDocumentUrl,
	removeDocumentUrl
) => {
	const {
		currentFolder,
		errors,
		params: { appealId, documentId }
	} = request;

	if (!currentFolder) {
		return response.status(404).render('app/404.njk');
	}

	const [document, redactionStatuses] = await Promise.all([
		getFileVersionsInfo(request.apiClient, appealId, documentId),
		getDocumentRedactionStatuses(request.apiClient)
	]);

	if (!document) {
		return response.status(404).render('app/404.njk');
	}

	if (!redactionStatuses) {
		return response.render('app/500.njk');
	}

	const mappedPageContent = await manageDocumentPage(
		appealId,
		backButtonUrl,
		uploadUpdatedDocumentUrl,
		removeDocumentUrl,
		redactionStatuses,
		document,
		currentFolder,
		request
	);

	return response.render('appeals/documents/manage-document.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * @param {string} backButtonUrl
 * @param {string} [nextPageUrl]
 * @param {string} [pageHeadingTextOverride]
 * @param {function} [successCallback]
 */
export const postDocumentDetails = async (
	request,
	response,
	backButtonUrl,
	nextPageUrl,
	pageHeadingTextOverride,
	successCallback
) => {
	try {
		const {
			body,
			apiClient,
			params: { appealId },
			errors
		} = request;

		if (errors) {
			return renderDocumentDetails(
				request,
				response,
				backButtonUrl,
				false,
				pageHeadingTextOverride
			);
		}

		const redactionStatuses = await getDocumentRedactionStatuses(apiClient);

		if (redactionStatuses) {
			const apiRequest = mapDocumentDetailsFormDataToAPIRequest(body, redactionStatuses);
			const updateDocumentsResult = await updateDocuments(apiClient, appealId, apiRequest);

			if (updateDocumentsResult) {
				addNotificationBannerToSession(
					request.session,
					'documentAdded',
					Number.parseInt(appealId, 10)
				);

				if (successCallback) {
					successCallback(request);
				}

				return response.redirect(nextPageUrl || `/appeals-service/appeal-details/${appealId}/`);
			}
		}

		return response.render('app/500.njk');
	} catch (error) {
		logger.error(
			error,
			error instanceof Error ? error.message : 'Something went wrong when adding document details'
		);

		return response.render('app/500.njk');
	}
};

/**
 * @typedef {Object} DocumentDetailsItem
 * @property {string} documentId
 * @property {import('#appeals/appeals.types.js').DayMonthYear} receivedDate
 * @property {import('@pins/appeals.api').Schema.DocumentRedactionStatus} redactionStatus
 */

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * @param {string} backButtonUrl
 */
export const renderChangeDocumentDetails = async (request, response, backButtonUrl) => {
	const {
		currentFolder,
		body,
		errors,
		params: { appealId, documentId }
	} = request;

	/** @type {DocumentDetailsItem[]} */
	let items = body?.items;

	const redactionStatuses = await getDocumentRedactionStatuses(request.apiClient);

	if (!redactionStatuses) {
		return response.status(500).render('app/500.njk');
	}

	if (!items) {
		const currentFile = await getFileInfo(request.apiClient, appealId, documentId);

		if (currentFile) {
			const receivedDate = new Date(currentFile?.latestDocumentVersion?.dateReceived);
			const redactionStatus = mapRedactionStatusIdToName(
				redactionStatuses,
				currentFile?.latestDocumentVersion?.redactionStatusId
			).toLowerCase();
			items ??= [
				{
					documentId: documentId,
					receivedDate: {
						day: receivedDate.getDate(),
						month: receivedDate.getMonth() + 1,
						year: receivedDate.getFullYear()
					},
					redactionStatus: redactionStatus
				}
			];
		}
	}
	if (!currentFolder) {
		return response.status(404).render('app/404.njk');
	}

	const mappedPageContent = changeDocumentDetailsPage(
		backButtonUrl,
		currentFolder,
		items,
		redactionStatuses
	);

	return response.render('appeals/documents/add-document-details.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * @param {string} backButtonUrl
 * @param {string} [nextPageUrl]
 */
export const postChangeDocumentDetails = async (request, response, backButtonUrl, nextPageUrl) => {
	try {
		const {
			body,
			apiClient,
			params: { appealId },
			errors
		} = request;

		if (errors) {
			return renderChangeDocumentDetails(request, response, backButtonUrl);
		}

		const redactionStatuses = await getDocumentRedactionStatuses(apiClient);

		if (redactionStatuses) {
			const apiRequest = mapDocumentDetailsFormDataToAPIRequest(body, redactionStatuses);
			const updateDocumentsResult = await updateDocuments(apiClient, appealId, apiRequest);

			if (updateDocumentsResult) {
				addNotificationBannerToSession(
					request.session,
					'documentDetailsUpdated',
					Number.parseInt(appealId, 10)
				);
				return response.redirect(nextPageUrl || `/appeals-service/appeal-details/${appealId}/`);
			}
		}

		return response.render('app/500.njk');
	} catch (error) {
		logger.error(
			error,
			error instanceof Error ? error.message : 'Something went wrong when adding document details'
		);

		return response.render('app/500.njk');
	}
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * @param {string} backButtonUrl
 */
export const renderDeleteDocument = async (request, response, backButtonUrl) => {
	const {
		currentFolder,
		errors,
		params: { appealId, documentId, versionId }
	} = request;

	if (!currentFolder) {
		return response.status(404).render('app/404.njk');
	}

	const [document, redactionStatuses] = await Promise.all([
		getFileVersionsInfo(request.apiClient, appealId, documentId),
		getDocumentRedactionStatuses(request.apiClient)
	]);

	if (!document) {
		return response.status(404).render('app/404.njk');
	}

	if (!redactionStatuses) {
		return response.render('app/500.njk');
	}

	const mappedPageContent = await deleteDocumentPage(
		backButtonUrl,
		redactionStatuses,
		document,
		currentFolder,
		versionId
	);

	return response.render('appeals/documents/delete-document.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * @param {string} returnUrl
 * @param {string} uploadNewDocumentVersionUrl
 */
export const postDocumentDelete = async (
	request,
	response,
	returnUrl,
	uploadNewDocumentVersionUrl
) => {
	const {
		apiClient,
		currentFolder,
		body,
		errors,
		params: { appealId, documentId, versionId }
	} = request;

	if (errors) {
		return renderDeleteDocument(request, response, returnUrl);
	}

	if (!currentFolder) {
		return response.status(404).render('app/404.njk');
	}

	if (!body['delete-file-answer'] || !appealId || !documentId || !versionId) {
		return response.render('app/500.njk');
	}

	const returnUrlProcessed = returnUrl?.replace('{{folderId}}', currentFolder.id);
	const uploadNewDocumentVersionUrlProcessed = uploadNewDocumentVersionUrl
		?.replace('{{folderId}}', currentFolder.id)
		.replace('{{documentId}}', documentId);

	if (!isInternalUrl(returnUrl, request) || !isInternalUrl(uploadNewDocumentVersionUrl, request)) {
		return response.status(400).render('errorPageTemplate', {
			message: 'Invalid redirection attempt detected.'
		});
	}

	if (body['delete-file-answer'] === 'no') {
		return response.redirect(returnUrlProcessed);
	} else if (body['delete-file-answer'] === 'yes') {
		await deleteDocument(apiClient, appealId, documentId, versionId);
		addNotificationBannerToSession(
			request.session,
			'documentDeleted',
			Number.parseInt(appealId, 10)
		);
		return response.redirect(returnUrlProcessed);
	} else if (body['delete-file-answer'] === 'yes-and-upload-another-document') {
		const fileVersionsInfo = await getFileVersionsInfo(request.apiClient, appealId, documentId);

		if (fileVersionsInfo?.documentVersion) {
			const deletingOnlyVersion =
				fileVersionsInfo?.documentVersion?.filter((version) => version.isDeleted === false).length <
				2;

			await deleteDocument(apiClient, appealId, documentId, versionId);
			return response.redirect(
				deletingOnlyVersion ? returnUrlProcessed : uploadNewDocumentVersionUrlProcessed
			);
		}
	}

	return response.render('app/500.njk');
};
