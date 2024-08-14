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
	addDocumentDetailsFormDataToFileUploadInfo,
	addDocumentDetailsPage,
	addDocumentsCheckAndConfirmPage,
	manageFolderPage,
	manageDocumentPage,
	changeDocumentDetailsPage,
	deleteDocumentPage,
	documentUploadPage
} from './appeal-documents.mapper.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { isInternalUrl } from '#lib/url-utilities.js';
import { objectContainsAllKeys } from '#lib/object-utilities.js';
import {
	createNewDocument,
	createNewDocumentVersion
} from '#app/components/file-uploader.component.js';
import config from '@pins/appeals.web/environment/config.js';
import { redactionStatusNameToId } from '#lib/redaction-statuses.js';
import { isFileUploadInfo } from '#lib/ts-utilities.js';
import { dateToDayMonthYear, dayMonthYearToApiDateString } from '#lib/dates.js';
import { folderIsAdditionalDocuments } from '#lib/documents.js';

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * @param {import('../appeal-details/appeal-details.types.js').WebAppeal} appealDetails
 * @param {string} backButtonUrl
 * @param {string} [nextPageUrl]
 * @param {boolean} [isLateEntry]
 * @param {string} [pageHeadingTextOverride]
 * @param {PageComponent[]} [pageBodyComponents]
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
	pageBodyComponents,
	allowMultipleFiles = true,
	documentType
) => {
	const {
		currentFolder,
		errors,
		params: { appealId, documentId },
		session
	} = request;

	if (!appealDetails || !currentFolder) {
		return response.status(404).render('app/404.njk');
	}

	let documentName;
	let _documentType = documentType;
	let latestVersion;

	if (documentId) {
		const fileVersionsInfo = await getFileVersionsInfo(request.apiClient, appealId, documentId);

		documentName = fileVersionsInfo?.latestDocumentVersion?.fileName;
		_documentType = fileVersionsInfo?.latestDocumentVersion?.documentType;
		latestVersion = fileVersionsInfo?.allVersions
			.map((versionInfo) => versionInfo.version)
			.sort((a, b) => b - a)[0];
	}

	const mappedPageContent = await documentUploadPage(
		appealId,
		appealDetails.appealReference,
		`${currentFolder.folderId}`,
		currentFolder.path,
		documentId,
		// @ts-ignore
		documentName,
		latestVersion,
		backButtonUrl,
		nextPageUrl,
		isLateEntry,
		session,
		errors,
		pageHeadingTextOverride,
		pageBodyComponents,
		allowMultipleFiles,
		_documentType
	);

	return response.status(200).render('appeals/documents/document-upload.njk', mappedPageContent);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * @param {string} nextPageUrl
 */
export const postDocumentUpload = async (request, response, nextPageUrl) => {
	const { body, currentAppeal, currentFolder } = request;

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404');
	}

	if (!body['upload-info']) {
		return response.status(500).render('app/500');
	}

	/** @type {import('#lib/ts-utilities.js').FileUploadInfoItem[]} */
	const uploadInfo = JSON.parse(body['upload-info']);

	if (!isFileUploadInfo(uploadInfo)) {
		return response.status(500).render('app/500');
	}

	const redactionStatuses = await getDocumentRedactionStatuses(request.apiClient);

	if (!redactionStatuses) {
		return response.status(500).render('app/500.njk');
	}

	request.session.fileUploadInfo = uploadInfo.map((infoItem) => ({
		...infoItem,
		redactionStatus: redactionStatusNameToId(redactionStatuses, 'unredacted'),
		receivedDate: dayMonthYearToApiDateString(dateToDayMonthYear(new Date()))
	}));

	response.redirect(nextPageUrl);
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * @param {string} backButtonUrl
 * @param {boolean} [isLateEntry]
 * @param {string} [pageHeadingTextOverride]
 * @param {string} [documentId]
 */
export const renderDocumentDetails = async (
	request,
	response,
	backButtonUrl,
	isLateEntry = false,
	pageHeadingTextOverride,
	documentId
) => {
	const { currentFolder, body, errors } = request;

	if (!currentFolder) {
		return response.status(404).render('app/404.njk');
	}

	if (!objectContainsAllKeys(request.session, 'fileUploadInfo')) {
		return response.status(500).render('app/500.njk');
	}

	const redactionStatuses = await getDocumentRedactionStatuses(request.apiClient);

	if (!redactionStatuses) {
		return response.status(500).render('app/500.njk');
	}

	const mappedPageContent = addDocumentDetailsPage(
		backButtonUrl,
		currentFolder,
		request.session.fileUploadInfo,
		body?.items,
		redactionStatuses,
		pageHeadingTextOverride,
		documentId
	);

	const isAdditionalDocument = folderIsAdditionalDocuments(currentFolder.path);

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
		return response.status(500).render('app/500.njk');
	}

	const mappedPageContent = manageFolderPage(
		backButtonUrl,
		viewAndEditUrl,
		currentFolder,
		redactionStatuses,
		request,
		pageHeadingTextOverride
	);

	return response.status(200).render('appeals/documents/manage-folder.njk', {
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
 * @param {string} [pageTitleTextOverride]
 */
export const renderManageDocument = async (
	request,
	response,
	backButtonUrl,
	uploadUpdatedDocumentUrl,
	removeDocumentUrl,
	pageTitleTextOverride
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
		return response.status(500).render('app/500.njk');
	}

	const mappedPageContent = await manageDocumentPage(
		appealId,
		backButtonUrl,
		uploadUpdatedDocumentUrl,
		removeDocumentUrl,
		document,
		currentFolder,
		request,
		pageTitleTextOverride
	);

	return response.status(200).render('appeals/documents/manage-document.njk', {
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
 */
export const postDocumentDetails = async (
	request,
	response,
	backButtonUrl,
	nextPageUrl,
	pageHeadingTextOverride
) => {
	try {
		const {
			body,
			currentFolder,
			apiClient,
			params: { appealId },
			errors
		} = request;

		if (errors) {
			return await renderDocumentDetails(
				request,
				response,
				backButtonUrl,
				false,
				pageHeadingTextOverride
			);
		}

		if (!currentFolder) {
			return response.status(404).render('app/404');
		}

		if (!objectContainsAllKeys(request.session, 'fileUploadInfo')) {
			return response.status(500).render('app/500.njk');
		}

		const redactionStatuses = await getDocumentRedactionStatuses(apiClient);

		if (redactionStatuses) {
			addDocumentDetailsFormDataToFileUploadInfo(
				body,
				request.session.fileUploadInfo,
				redactionStatuses
			);

			return response.redirect(
				nextPageUrl?.replace('{{folderId}}', currentFolder.folderId) ||
					`/appeals-service/appeal-details/${appealId}/`
			);
		}

		return response.status(500).render('app/500.njk');
	} catch (error) {
		logger.error(
			error,
			error instanceof Error ? error.message : 'Something went wrong when adding document details'
		);

		return response.status(500).render('app/500.njk');
	}
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * @param {string} backLinkUrl
 */
export const renderUploadDocumentsCheckAndConfirm = async (request, response, backLinkUrl) => {
	const { currentAppeal, currentFolder } = request;

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

	const mappedPageContent = addDocumentsCheckAndConfirmPage(
		backLinkUrl,
		currentAppeal.appealReference,
		request.session.fileUploadInfo,
		redactionStatuses
	);

	return response.render('patterns/check-and-confirm-page.pattern.njk', {
		pageContent: mappedPageContent
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * @param {string} [nextPageUrl]
 * @param {function} [successCallback]
 */
export const postUploadDocumentsCheckAndConfirm = async (
	request,
	response,
	nextPageUrl,
	successCallback
) => {
	const { currentAppeal, currentFolder } = request;

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404');
	}

	if (!objectContainsAllKeys(request.session, 'fileUploadInfo')) {
		return response.status(500).render('app/500.njk');
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
				(/** @type {import('#lib/ts-utilities.js').FileUploadInfoItem} */ document) => {
					/** @type {import('@pins/appeals/index.js').MappedDocument} */
					const mappedDocument = {
						caseId: currentAppeal.appealId,
						documentName: document.name,
						documentType: document.documentType,
						mimeType: document.mimeType,
						documentSize: document.size,
						stage: document.stage,
						fileRowId: document.fileRowId,
						folderId: currentFolder.folderId,
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

		delete request.session.fileUploadInfo;

		addNotificationBannerToSession(
			request.session,
			'documentAdded',
			Number.parseInt(currentAppeal.appealId, 10)
		);

		if (successCallback) {
			successCallback(request);
		}

		if (nextPageUrl) {
			return response.redirect(nextPageUrl);
		}
	} catch (error) {
		logger.error(
			error,
			error instanceof Error
				? error.message
				: 'Something went wrong when submitting the upload documents check and confirm page'
		);
	}
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * @param {string} nextPageUrl
 */
export const postUploadDocumentVersionCheckAndConfirm = async (request, response, nextPageUrl) => {
	const { currentAppeal, currentFolder } = request;

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404');
	}

	if (!objectContainsAllKeys(request.session, 'fileUploadInfo')) {
		return response.status(500).render('app/500.njk');
	}

	try {
		const {
			currentAppeal,
			session: { fileUploadInfo },
			params: { documentId }
		} = request;
		const uploadInfo = fileUploadInfo[0];

		/** @type {import('@pins/appeals/index.js').AddDocumentVersionRequest} */
		const addDocumentVersionRequestPayload = {
			blobStorageHost:
				config.useBlobEmulator === true ? config.blobEmulatorSasUrl : config.blobStorageUrl,
			blobStorageContainer: config.blobStorageDefaultContainer,
			document: {
				caseId: currentAppeal.appealId,
				documentName: uploadInfo.name,
				documentType: uploadInfo.documentType,
				mimeType: uploadInfo.mimeType,
				documentSize: uploadInfo.size,
				stage: uploadInfo.stage,
				fileRowId: uploadInfo.fileRowId,
				folderId: currentFolder.folderId,
				GUID: uploadInfo.GUID,
				receivedDate: uploadInfo.receivedDate,
				redactionStatusId: uploadInfo.redactionStatus,
				blobStoragePath: uploadInfo.blobStoreUrl
			}
		};

		await createNewDocumentVersion(
			request.apiClient,
			currentAppeal.appealId,
			documentId,
			addDocumentVersionRequestPayload
		);

		delete request.session.fileUploadInfo;

		return response.redirect(nextPageUrl);
	} catch (error) {
		logger.error(
			error,
			error instanceof Error
				? error.message
				: 'Something went wrong when submitting the upload documents check and confirm page'
		);

		return response.status(500).render('app/500.njk');
	}
};

/**
 * @typedef {Object} DocumentDetailsItem
 * @property {string} name
 * @property {string} documentId
 * @property {import('#appeals/appeals.types.js').DayMonthYear|undefined} receivedDate
 * @property {import('@pins/appeals.api').Schema.DocumentRedactionStatus} redactionStatus
 */

/** @typedef {import('@pins/appeals.api').Schema.Document} Document */

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * @param {string} backButtonUrl
 */
export const renderChangeDocumentDetails = async (request, response, backButtonUrl) => {
	const {
		currentFolder,
		errors,
		params: { appealId, documentId }
	} = request;

	if (!currentFolder) {
		return response.status(500).render('app/500.njk');
	}

	const redactionStatuses = await getDocumentRedactionStatuses(request.apiClient);

	if (!redactionStatuses) {
		return response.status(500).render('app/500.njk');
	}

	const currentFile = await getFileInfo(request.apiClient, appealId, documentId);

	if (!currentFile) {
		return response.status(500).render('app/500.njk');
	}

	const mappedPageContent = changeDocumentDetailsPage(
		backButtonUrl,
		currentFolder,
		currentFile,
		redactionStatuses
	);

	return response.status(200).render('appeals/documents/add-document-details.njk', {
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
			return await renderChangeDocumentDetails(request, response, backButtonUrl);
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

		return response.status(500).render('app/500.njk');
	} catch (error) {
		logger.error(
			error,
			error instanceof Error ? error.message : 'Something went wrong when adding document details'
		);

		return response.status(500).render('app/500.njk');
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
		return response.status(500).render('app/500.njk');
	}

	const mappedPageContent = await deleteDocumentPage(
		backButtonUrl,
		redactionStatuses,
		document,
		currentFolder,
		versionId
	);

	return response.status(200).render('appeals/documents/delete-document.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * @param {string} returnUrl
 * @param {string} cancelUrl
 * @param {string} uploadNewDocumentUrl
 */
export const postDeleteDocument = async (
	request,
	response,
	returnUrl,
	cancelUrl,
	uploadNewDocumentUrl
) => {
	const {
		apiClient,
		currentFolder,
		body,
		errors,
		params: { appealId, documentId, versionId }
	} = request;

	if (errors) {
		return await renderDeleteDocument(request, response, cancelUrl);
	}

	if (!currentFolder) {
		return response.status(404).render('app/404.njk');
	}

	if (!body['delete-file-answer'] || !appealId || !documentId || !versionId) {
		return response.status(500).render('app/500.njk');
	}

	const cancelUrlProcessed = cancelUrl
		?.replace('{{folderId}}', currentFolder.folderId)
		.replace('{{documentId}}', documentId);
	const uploadNewDocumentUrlProcessed = uploadNewDocumentUrl?.replace(
		'{{folderId}}',
		currentFolder.folderId
	);

	if (
		!isInternalUrl(returnUrl, request) ||
		!isInternalUrl(cancelUrl, request) ||
		!isInternalUrl(uploadNewDocumentUrl, request)
	) {
		return response.status(400).render('errorPageTemplate', {
			message: 'Invalid redirection attempt detected.'
		});
	}

	if (body['delete-file-answer'] === 'no') {
		const cancelUrlProcessedSafe = new URL(
			cancelUrlProcessed,
			`${request.protocol}://${request.headers.host}`
		);
		return response.redirect(cancelUrlProcessedSafe.toString());
	} else if (body['delete-file-answer'] === 'yes') {
		await deleteDocument(apiClient, appealId, documentId, versionId);
		addNotificationBannerToSession(
			request.session,
			'documentDeleted',
			Number.parseInt(appealId, 10)
		);
		return response.redirect(returnUrl);
	} else if (body['delete-file-answer'] === 'yes-and-upload-another-document') {
		const fileVersionsInfo = await getFileVersionsInfo(request.apiClient, appealId, documentId);

		if (fileVersionsInfo?.allVersions) {
			const deletingOnlyVersion =
				fileVersionsInfo?.allVersions?.filter((version) => version.isDeleted === false).length < 2;

			if (deletingOnlyVersion) {
				await deleteDocument(apiClient, appealId, documentId, versionId);
				return response.redirect(uploadNewDocumentUrlProcessed);
			} else {
				return response.status(500).render('app/500.njk');
			}
		}
	}

	return response.status(500).render('app/500.njk');
};
