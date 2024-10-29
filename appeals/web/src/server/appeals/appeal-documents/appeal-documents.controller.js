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
	changeDocumentFileNamePage,
	deleteDocumentPage,
	documentUploadPage,
	mapDocumentFileNameFormDataToAPIRequest
} from './appeal-documents.mapper.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { isInternalUrl, safeRedirect } from '#lib/url-utilities.js';
import { objectContainsAllKeys } from '#lib/object-utilities.js';
import {
	createNewDocument,
	createNewDocumentVersion
} from '#app/components/file-uploader.component.js';
import config from '@pins/appeals.web/environment/config.js';
import { isFileUploadInfoItemArray } from '#lib/ts-utilities.js';
import { getTodaysISOString } from '#lib/dates.js';
import { folderIsAdditionalDocuments } from '#lib/documents.js';

/**
 * @param {Object} params
 * @param {import('@pins/express/types/express.js').Request} params.request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} params.response
 * @param {import('../appeal-details/appeal-details.types.js').WebAppeal} params.appealDetails
 * @param {string} params.backButtonUrl
 * @param {string} [params.nextPageUrl]
 * @param {boolean} [params.isLateEntry]
 * @param {string} [params.pageHeadingTextOverride]
 * @param {PageComponent[]} [params.pageBodyComponents]
 * @param {boolean} [params.allowMultipleFiles]
 * @param {string} [params.documentType]
 */
export const renderDocumentUpload = async ({
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
}) => {
	const {
		currentFolder,
		errors,
		params: { appealId, documentId },
		session
	} = request;

	if (!appealDetails || !currentFolder) {
		return response.status(404).render('app/404.njk');
	}

	if (
		'fileUploadInfo' in request.session &&
		request.session.fileUploadInfo.appealId !== `${currentFolder.appealId}` &&
		request.session.fileUploadInfo.folderId !== `${currentFolder.folderId}`
	) {
		delete request.session.fileUploadInfo;
	}

	const filenamesInFolder = currentFolder.documents
		? Buffer.from(
				JSON.stringify(
					currentFolder.documents.map(
						(/** @type {import('@pins/appeals.api').Appeals.DocumentInfo} */ documentInfo) =>
							documentInfo.name
					)
				)
		  ).toString('base64')
		: '';

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
		session.fileUploadInfo,
		errors,
		pageHeadingTextOverride,
		pageBodyComponents,
		allowMultipleFiles,
		_documentType,
		filenamesInFolder
	);

	return response.status(200).render('appeals/documents/document-upload.njk', mappedPageContent);
};

/**
 * @param {Object} params
 * @param {import('@pins/express/types/express.js').Request} params.request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} params.response
 * @param {string} params.nextPageUrl
 */
export const postDocumentUpload = async ({ request, response, nextPageUrl }) => {
	const { body, currentAppeal, currentFolder } = request;

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404');
	}

	if (!body['upload-info']) {
		return response.status(500).render('app/500');
	}

	/** @type {import('#appeals/appeal-documents/appeal-documents.types').FileUploadInfoItem[]} */
	const uploadInfo = JSON.parse(body['upload-info']);

	if (!isFileUploadInfoItemArray(uploadInfo)) {
		return response.status(500).render('app/500');
	}

	const redactionStatuses = await getDocumentRedactionStatuses(request.apiClient);

	if (!redactionStatuses) {
		return response.status(500).render('app/500.njk');
	}

	/** @type {import('#appeals/appeal-documents/appeal-documents.types').UncommittedFile[]} */
	const uncommittedFiles = uploadInfo.map((infoItem) => ({
		...infoItem,
		receivedDate: getTodaysISOString()
	}));

	/** @type {import('#appeals/appeal-documents/appeal-documents.types').FileUploadInfo} */
	request.session.fileUploadInfo = {
		appealId: `${currentAppeal.appealId}`,
		folderId: `${currentFolder.folderId}`,
		files: uncommittedFiles
	};

	response.redirect(nextPageUrl);
};

/**
 * @param {Object} params
 * @param {import('@pins/express/types/express.js').Request} params.request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} params.response
 * @param {string} params.backLinkUrl
 * @param {boolean} [params.isLateEntry]
 * @param {string} [params.pageHeadingTextOverride]
 * @param {string} [params.dateLabelTextOverride]
 * @param {string} [params.documentId]
 */
export const renderDocumentDetails = async ({
	request,
	response,
	backLinkUrl,
	isLateEntry = false,
	pageHeadingTextOverride,
	dateLabelTextOverride,
	documentId
}) => {
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

	const mappedPageContent = addDocumentDetailsPage({
		backLinkUrl,
		folder: currentFolder,
		uncommittedFiles: request.session.fileUploadInfo.files,
		bodyItems: body?.items,
		redactionStatuses,
		pageHeadingTextOverride,
		dateLabelTextOverride,
		documentId
	});

	const isAdditionalDocument = folderIsAdditionalDocuments(currentFolder.path);

	return response.render('appeals/documents/add-document-details.njk', {
		pageContent: mappedPageContent,
		displayLateEntryContent: isAdditionalDocument && isLateEntry,
		errors
	});
};

/**
 * @param {Object} params
 * @param {import('@pins/express/types/express.js').Request} params.request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} params.response
 * @param {string} params.backLinkUrl
 * @param {string} params.viewAndEditUrl
 * @param {string} [params.pageHeadingTextOverride]
 * @param {string} [params.dateColumnLabelTextOverride]
 */
export const renderManageFolder = async ({
	request,
	response,
	backLinkUrl,
	viewAndEditUrl,
	pageHeadingTextOverride,
	dateColumnLabelTextOverride
}) => {
	const { currentFolder, errors } = request;

	if (!currentFolder) {
		return response.status(404).render('app/404.njk');
	}

	const mappedPageContent = manageFolderPage({
		backLinkUrl,
		viewAndEditUrl,
		folder: currentFolder,
		request,
		pageHeadingTextOverride,
		dateColumnLabelTextOverride
	});

	return response.status(200).render('appeals/documents/manage-folder.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/**
 * @param {Object} params
 * @param {import('@pins/express/types/express.js').Request} params.request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} params.response
 * @param {string} params.backLinkUrl
 * @param {string} params.uploadUpdatedDocumentUrl
 * @param {string} params.removeDocumentUrl
 * @param {string} [params.pageTitleTextOverride]
 * @param {string} [params.dateRowLabelTextOverride]
 */
export const renderManageDocument = async ({
	request,
	response,
	backLinkUrl,
	uploadUpdatedDocumentUrl,
	removeDocumentUrl,
	pageTitleTextOverride,
	dateRowLabelTextOverride
}) => {
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

	const mappedPageContent = await manageDocumentPage({
		appealId,
		backLinkUrl,
		uploadUpdatedDocumentUrl,
		removeDocumentUrl,
		document,
		folder: currentFolder,
		request,
		pageTitleTextOverride,
		dateRowLabelTextOverride
	});

	return response.status(200).render('appeals/documents/manage-document.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/**
 * @param {Object} params
 * @param {import('@pins/express/types/express.js').Request} params.request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} params.response
 * @param {string} params.backLinkUrl
 * @param {string} [params.nextPageUrl]
 * @param {string} [params.pageHeadingTextOverride]
 */
export const postDocumentDetails = async ({
	request,
	response,
	backLinkUrl,
	nextPageUrl,
	pageHeadingTextOverride
}) => {
	try {
		const {
			body,
			currentFolder,
			apiClient,
			params: { appealId },
			errors
		} = request;

		if (errors) {
			return await renderDocumentDetails({
				request,
				response,
				backLinkUrl,
				pageHeadingTextOverride
			});
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
				request.session.fileUploadInfo.files,
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
 * @param {Object} params
 * @param {import('@pins/express/types/express.js').Request} params.request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} params.response
 * @param {string} params.backLinkUrl
 * @param {string} params.changeFileLinkUrl
 * @param {string} params.changeDateLinkUrl
 * @param {string} params.changeRedactionStatusLinkUrl
 * @param {string} [params.summaryListNameLabelOverride]
 * @param {string} [params.summaryListDateLabelOverride]
 */
export const renderUploadDocumentsCheckAndConfirm = async ({
	request,
	response,
	backLinkUrl,
	changeFileLinkUrl,
	changeDateLinkUrl,
	changeRedactionStatusLinkUrl,
	summaryListNameLabelOverride,
	summaryListDateLabelOverride
}) => {
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

	let documentVersion;
	let documentFileName;

	if (documentId) {
		const fileInfo = await getFileInfo(request.apiClient, currentAppeal.appealId, documentId);

		if (!fileInfo) {
			return response.status(404).render('app/404');
		}

		if (!('latestDocumentVersion' in fileInfo) || !('name' in fileInfo)) {
			return response.status(500).render('app/500.njk');
		}

		documentVersion = fileInfo.latestDocumentVersion.version + 1;
		documentFileName = fileInfo.name;
	}

	const mappedPageContent = addDocumentsCheckAndConfirmPage({
		backLinkUrl,
		changeFileLinkUrl,
		changeDateLinkUrl,
		changeRedactionStatusLinkUrl,
		appealReference: currentAppeal.appealReference,
		uncommittedFiles: request.session.fileUploadInfo.files,
		redactionStatuses,
		documentVersion,
		documentFileName,
		...(summaryListNameLabelOverride && {
			summaryListNameLabelOverride
		}),
		...(summaryListDateLabelOverride && {
			summaryListDateLabelOverride
		})
	});

	return response.render('patterns/check-and-confirm-page.pattern.njk', {
		pageContent: mappedPageContent
	});
};

/**
 * @param {Object} params
 * @param {import('@pins/express/types/express.js').Request} params.request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} params.response
 * @param {string} [params.nextPageUrl]
 * @param {function} [params.successCallback]
 */
export const postUploadDocumentsCheckAndConfirm = async ({
	request,
	response,
	nextPageUrl,
	successCallback
}) => {
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
 * @param {Object} params
 * @param {import('@pins/express/types/express.js').Request} params.request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} params.response
 * @param {string} [params.nextPageUrl]
 */
export const postUploadDocumentVersionCheckAndConfirm = async ({
	request,
	response,
	nextPageUrl
}) => {
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
		const uploadInfo = fileUploadInfo.files[0];

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

		addNotificationBannerToSession(
			request.session,
			'documentVersionAdded',
			Number.parseInt(currentAppeal.appealId, 10)
		);

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

		return response.status(500).render('app/500.njk');
	}
};

/**
 * @typedef {Object} DocumentDetailsItem
 * @property {string} name
 * @property {string} documentId
 * @property {import('#appeals/appeals.types.js').DayMonthYearHourMinute|undefined} receivedDate
 * @property {import('@pins/appeals.api').Schema.DocumentRedactionStatus} redactionStatus
 */

/** @typedef {import('@pins/appeals.api').Schema.Document} Document */
/**
 * @param {Object} params
 * @param {import('@pins/express/types/express.js').Request} params.request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} params.response
 * @param {string} params.backButtonUrl
 */
export const renderChangeDocumentFileName = async ({ request, response, backButtonUrl }) => {
	const {
		currentFolder,
		errors,
		params: { appealId, documentId }
	} = request;

	if (!currentFolder) {
		return response.status(500).render('app/500.njk');
	}

	const currentFile = await getFileInfo(request.apiClient, appealId, documentId);

	if (!currentFile) {
		return response.status(500).render('app/500.njk');
	}

	const mappedPageContent = changeDocumentFileNamePage(backButtonUrl, currentFolder, currentFile);

	return response.status(200).render('appeals/documents/add-document-details.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/**
 * @param {Object} params
 * @param {import('@pins/express/types/express.js').Request} params.request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} params.response
 * @param {string} params.backButtonUrl
 * @param {string} [params.nextPageUrl]
 */
export const postChangeDocumentFileName = async ({
	request,
	response,
	backButtonUrl,
	nextPageUrl
}) => {
	try {
		const {
			body,
			apiClient,
			params: { appealId },
			errors
		} = request;

		if (errors) {
			return await renderChangeDocumentFileName({ request, response, backButtonUrl });
		}

		const currentFile = await getFileInfo(request.apiClient, appealId, body.documentId);

		if (!currentFile) {
			return response.status(500).render('app/500.njk');
		}

		const { dateReceived, redactionStatus } = currentFile.latestDocumentVersion;

		const redactionStatuses = await getDocumentRedactionStatuses(apiClient);

		const apiRequest = mapDocumentFileNameFormDataToAPIRequest(
			body,
			dateReceived,
			redactionStatus,
			redactionStatuses
		);
		const updateDocumentsResult = await updateDocuments(apiClient, appealId, apiRequest);

		if (updateDocumentsResult) {
			addNotificationBannerToSession(
				request.session,
				'documentFilenameUpdated',
				Number.parseInt(appealId, 10)
			);
			return response.redirect(nextPageUrl || `/appeals-service/appeal-details/${appealId}/`);
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
 * @param {Object} params
 * @param {import('@pins/express/types/express.js').Request} params.request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} params.response
 * @param {string} params.backButtonUrl
 */
export const renderChangeDocumentDetails = async ({ request, response, backButtonUrl }) => {
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
 * @param {Object} params
 * @param {import('@pins/express/types/express.js').Request} params.request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} params.response
 * @param {string} params.backButtonUrl
 * @param {string} [params.nextPageUrl]
 */
export const postChangeDocumentDetails = async ({
	request,
	response,
	backButtonUrl,
	nextPageUrl
}) => {
	try {
		const {
			body,
			apiClient,
			params: { appealId },
			errors
		} = request;

		if (errors) {
			return await renderChangeDocumentDetails({ request, response, backButtonUrl });
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
 * @param {Object} params
 * @param {import('@pins/express/types/express.js').Request} params.request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} params.response
 * @param {string} params.backButtonUrl
 */
export const renderDeleteDocument = async ({ request, response, backButtonUrl }) => {
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
 * @param {Object} params
 * @param {import('@pins/express/types/express.js').Request} params.request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} params.response
 * @param {string} params.returnUrl
 * @param {string} params.cancelUrl
 * @param {string} params.uploadNewDocumentUrl
 */
export const postDeleteDocument = async ({
	request,
	response,
	returnUrl,
	cancelUrl,
	uploadNewDocumentUrl
}) => {
	const {
		apiClient,
		currentFolder,
		body,
		errors,
		params: { appealId, documentId, versionId }
	} = request;

	if (errors) {
		return await renderDeleteDocument({ request, response, backButtonUrl: cancelUrl });
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
		!isInternalUrl(cancelUrlProcessed, request) ||
		!isInternalUrl(uploadNewDocumentUrlProcessed, request)
	) {
		return response.status(400).render('errorPageTemplate', {
			message: 'Invalid redirection attempt detected.'
		});
	}

	if (body['delete-file-answer'] === 'no') {
		return safeRedirect(request, response, cancelUrlProcessed);
	} else if (body['delete-file-answer'] === 'yes') {
		await deleteDocument(apiClient, appealId, documentId, versionId);
		addNotificationBannerToSession(
			request.session,
			'documentDeleted',
			Number.parseInt(appealId, 10)
		);
		return response.redirect(returnUrl);
	}

	return response.status(500).render('app/500.njk');
};

/**
 * @param {Object} params
 * @param {import('@pins/express/types/express.js').Request} params.request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} params.response
 */
export const deleteUncommittedDocumentFromSession = async ({ request, response }) => {
	const {
		params: { guid },
		session
	} = request;

	const index = session.fileUploadInfo?.files.findIndex(
		(
			/** @type {import('#appeals/appeal-documents/appeal-documents.types').FileUploadInfoItem} */ fileInfoItem
		) => fileInfoItem.GUID === guid
	);

	if (index >= 0) {
		session.fileUploadInfo?.files.splice(index, 1);
		response.status(200).send('OK');
		return;
	}

	response.status(500).send('ERROR');
};
