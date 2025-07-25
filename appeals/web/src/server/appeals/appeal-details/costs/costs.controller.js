import { decisionCheckAndConfirmPage } from './costs.mapper.js';
import {
	renderDocumentUpload,
	postDocumentUpload,
	renderDocumentDetails,
	postDocumentDetails,
	renderManageFolder,
	renderManageDocument,
	renderDeleteDocument,
	postDeleteDocument,
	renderUploadDocumentsCheckAndConfirm,
	postUploadDocumentsCheckAndConfirm,
	postUploadDocumentVersionCheckAndConfirm,
	renderChangeDocumentDetails,
	postChangeDocumentDetails,
	renderChangeDocumentFileName,
	postChangeDocumentFileName
} from '#appeals/appeal-documents/appeal-documents.controller.js';
import {
	getDocumentRedactionStatuses,
	getFileInfo,
	getDocumentFileType
} from '#appeals/appeal-documents/appeal.documents.service.js';
import { capitalize } from 'lodash-es';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { capitalizeFirstLetter } from '#lib/string-utilities.js';
import logger from '#lib/logger.js';
import { mapFolderNameToDisplayLabel } from '#lib/mappers/utils/documents-and-folders.js';

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getDocumentUpload = async (request, response) => {
	const {
		session,
		currentAppeal,
		currentFolder,
		params: { costsCategory, costsDocumentType }
	} = request;

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404.njk');
	}

	let uploadPageHeadingText = '';
	let documentTitle = undefined;
	switch (costsCategory) {
		case 'lpa':
			uploadPageHeadingText = `Upload LPA costs ${costsDocumentType} document`;
			documentTitle = `LPA costs ${costsDocumentType}`;
			break;
		case 'decision':
			uploadPageHeadingText = `Upload costs decision`;
			break;
		default:
			uploadPageHeadingText = `Upload ${costsCategory} costs ${costsDocumentType} document`;
			documentTitle = `${costsCategory} costs ${costsDocumentType}`;
			break;
	}

	await renderDocumentUpload({
		request,
		response,
		appealDetails: currentAppeal,
		backButtonUrl: `/appeals-service/appeal-details/${currentAppeal.appealId}`,
		documentTitle: documentTitle,
		nextPageUrl:
			costsCategory === 'decision'
				? `/appeals-service/appeal-details/${currentAppeal.appealId}/costs/decision/add-document-details/${currentFolder.folderId}`
				: `/appeals-service/appeal-details/${currentAppeal.appealId}/costs/${costsCategory}/${costsDocumentType}/add-document-details/${currentFolder.folderId}`,
		pageHeadingTextOverride: uploadPageHeadingText,
		documentType: session.costsDocumentType
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postDocumentUploadPage = async (request, response) => {
	const {
		currentAppeal,
		currentFolder,
		params: { costsCategory, costsDocumentType }
	} = request;

	await postDocumentUpload({
		request,
		response,
		nextPageUrl:
			costsCategory === 'decision'
				? `/appeals-service/appeal-details/${currentAppeal.appealId}/costs/decision/add-document-details/${currentFolder.folderId}`
				: `/appeals-service/appeal-details/${currentAppeal.appealId}/costs/${costsCategory}/${costsDocumentType}/add-document-details/${currentFolder.folderId}`
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getDocumentVersionUpload = async (request, response) => {
	const {
		apiClient,
		currentAppeal,
		currentFolder,
		params: { costsCategory, costsDocumentType, documentId }
	} = request;

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404.njk');
	}

	const [pageHeading, uploadContainerHeading] = (() => {
		if (!costsDocumentType) {
			return [];
		}

		const categoryText = costsCategory === 'lpa' ? 'LPA' : costsCategory;
		const headingText = `${categoryText} ${costsDocumentType}`;

		return [capitalizeFirstLetter(headingText), `Upload ${headingText}`];
	})();

	const allowedType = await getDocumentFileType(apiClient, currentAppeal.appealId, documentId);

	await renderDocumentUpload({
		request,
		response,
		appealDetails: currentAppeal,
		backButtonUrl:
			costsCategory === 'decision'
				? `/appeals-service/appeal-details/${currentAppeal.appealId}/costs/decision/manage-documents/${currentFolder.folderId}/${documentId}`
				: `/appeals-service/appeal-details/${currentAppeal.appealId}/costs/${costsCategory}/${costsDocumentType}/manage-documents/${currentFolder.folderId}/${documentId}`,
		nextPageUrl:
			costsCategory === 'decision'
				? `/appeals-service/appeal-details/${currentAppeal.appealId}/costs/decision/add-document-details/${currentFolder.folderId}/${documentId}`
				: `/appeals-service/appeal-details/${currentAppeal.appealId}/costs/${costsCategory}/${costsDocumentType}/add-document-details/${currentFolder.folderId}/${documentId}`,
		allowMultipleFiles: false,
		allowedTypes: allowedType ? [allowedType] : undefined,
		...(pageHeading &&
			uploadContainerHeading && {
				pageHeadingTextOverride: pageHeading,
				uploadContainerHeadingTextOverride: uploadContainerHeading
			})
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postDocumentVersionUpload = async (request, response) => {
	const {
		currentAppeal,
		currentFolder,
		params: { costsCategory, costsDocumentType, documentId }
	} = request;

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404');
	}

	await postDocumentUpload({
		request,
		response,
		nextPageUrl:
			costsCategory === 'decision'
				? `/appeals-service/appeal-details/${currentAppeal.appealId}/costs/decision/add-document-details/${currentFolder.folderId}/${documentId}`
				: `/appeals-service/appeal-details/${currentAppeal.appealId}/costs/${costsCategory}/${costsDocumentType}/add-document-details/${currentFolder.folderId}/${documentId}`
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getAddDocumentDetails = async (request, response) => {
	const {
		currentAppeal,
		currentFolder,
		params: { costsCategory, costsDocumentType, documentId }
	} = request;

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404.njk');
	}

	let costsCategoryLabel = `${capitalize(costsCategory)} costs ${costsDocumentType} document`;

	switch (costsCategory) {
		case 'lpa':
			costsCategoryLabel = `LPA costs ${costsDocumentType} document`;
			break;
		case 'decision':
			costsCategoryLabel = 'Costs decision document';
			break;
	}

	const documentIdFragment = documentId ? `/${documentId}` : '';

	await renderDocumentDetails({
		request,
		response,
		backLinkUrl:
			costsCategory === 'decision'
				? `/appeals-service/appeal-details/${currentAppeal.appealId}/costs/decision/upload-documents/${currentFolder?.folderId}${documentIdFragment}`
				: `/appeals-service/appeal-details/${currentAppeal.appealId}/costs/${costsCategory}/${costsDocumentType}/upload-documents/${currentFolder?.folderId}${documentIdFragment}`,
		pageHeadingTextOverride: costsCategoryLabel,
		documentId,
		...(costsCategory === 'decision' && {
			dateLabelTextOverride: 'Decision date'
		})
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postAddDocumentDetails = async (request, response) => {
	const {
		currentAppeal,
		currentFolder,
		params: { costsCategory, costsDocumentType, documentId }
	} = request;

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404.njk');
	}

	let costsCategoryLabel = `${capitalize(costsCategory)} costs ${costsDocumentType} document`;

	switch (costsCategory) {
		case 'lpa':
			costsCategoryLabel = `LPA costs ${costsDocumentType} document`;
			break;
		case 'decision':
			costsCategoryLabel = 'Costs decision document';
			break;
	}

	const documentIdFragment = documentId ? `/${documentId}` : '';

	await postDocumentDetails({
		request,
		response,
		backLinkUrl: `/appeals-service/appeal-details/${currentAppeal.appealId}/costs/${costsCategory}/upload-documents/${currentFolder?.folderId}`,
		nextPageUrl:
			costsCategory === 'decision'
				? `/appeals-service/appeal-details/${currentAppeal.appealId}/costs/decision/check-and-confirm/${currentFolder?.folderId}${documentIdFragment}`
				: `/appeals-service/appeal-details/${currentAppeal.appealId}/costs/${costsCategory}/${costsDocumentType}/check-your-answers/${currentFolder?.folderId}${documentIdFragment}`,
		pageHeadingTextOverride: costsCategoryLabel
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
		params: { costsCategory, costsDocumentType, documentId }
	} = request;

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404');
	}

	const addDocumentDetailsPageUrl = `/appeals-service/appeal-details/${
		currentAppeal.appealId
	}/costs/${costsCategory}/${costsDocumentType}/add-document-details/${currentFolder.folderId}${
		documentId ? `/${documentId}` : ''
	}`;

	await renderUploadDocumentsCheckAndConfirm({
		request,
		response,
		backLinkUrl: addDocumentDetailsPageUrl,
		changeFileLinkUrl: `/appeals-service/appeal-details/${
			request.currentAppeal.appealId
		}/costs/${costsCategory}/${costsDocumentType}/upload-documents/${currentFolder.folderId}${
			documentId ? `/${documentId}` : ''
		}`,
		changeDateLinkUrl: addDocumentDetailsPageUrl,
		changeRedactionStatusLinkUrl: addDocumentDetailsPageUrl
	});
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postAddDocumentsCheckAndConfirm = async (request, response) => {
	const { currentAppeal, currentFolder, session } = request;

	if (!currentAppeal) {
		return response.status(404).render('app/404');
	}

	try {
		await postUploadDocumentsCheckAndConfirm({
			request,
			response,
			nextPageUrl: `/appeals-service/appeal-details/${currentAppeal.appealId}`,
			successCallback: (
				/** @type {import('@pins/express/types/express.js').Request} */ request
			) => {
				if (request.session.costsDocumentType) {
					delete request.session.costsDocumentType;
				}

				addNotificationBannerToSession({
					session,
					bannerDefinitionKey: 'documentAdded',
					appealId: currentAppeal.appealId,
					text: `${mapFolderNameToDisplayLabel(currentFolder.path)} added`
				});
			}
		});
	} catch (error) {
		logger.error(
			error,
			error instanceof Error ? error.message : 'Something went wrong when adding costs documents'
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
			nextPageUrl: `/appeals-service/appeal-details/${currentAppeal.appealId}`
		});
	} catch (error) {
		logger.error(
			error,
			error instanceof Error
				? error.message
				: 'Something went wrong when adding costs document version'
		);

		return response.status(500).render('app/500.njk');
	}
};

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getManageFolder = async (request, response) => {
	const {
		currentAppeal,
		currentFolder,
		params: { costsCategory, costsDocumentType }
	} = request;

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404.njk');
	}

	let costsCategoryLabel = `${capitalize(costsCategory)} costs ${costsDocumentType} documents`;

	switch (costsCategory) {
		case 'lpa':
			costsCategoryLabel = `LPA costs ${costsDocumentType} documents`;
			break;
		case 'decision':
			costsCategoryLabel = 'Costs decision documents';
			break;
	}

	await renderManageFolder({
		request,
		response,
		backLinkUrl: `/appeals-service/appeal-details/${request.params.appealId}`,
		viewAndEditUrl:
			costsCategory === 'decision'
				? `/appeals-service/appeal-details/${request.params.appealId}/costs/decision/manage-documents/${currentFolder.folderId}/{{documentId}}`
				: `/appeals-service/appeal-details/${request.params.appealId}/costs/${costsCategory}/${costsDocumentType}/manage-documents/${currentFolder.folderId}/{{documentId}}`,
		addButtonUrl:
			costsCategory === 'decision'
				? `/appeals-service/appeal-details/${request.params.appealId}/costs/decision/upload-documents/${currentFolder.folderId}`
				: `/appeals-service/appeal-details/${request.params.appealId}/costs/${costsCategory}/${costsDocumentType}/upload-documents/${currentFolder.folderId}`,
		pageHeadingTextOverride: costsCategoryLabel,
		addButtonTextOverride: `Add document${costsCategory === 'decision' ? 's' : ''}`,
		...(costsCategory === 'decision' && {
			dateColumnLabelTextOverride: 'Decision date'
		})
	});
};

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getManageDocument = async (request, response) => {
	const {
		currentAppeal,
		currentFolder,
		params: { costsCategory, costsDocumentType }
	} = request;

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404.njk');
	}

	await renderManageDocument({
		request,
		response,
		backLinkUrl:
			costsCategory === 'decision'
				? `/appeals-service/appeal-details/${request.params.appealId}/costs/decision/manage-documents/${currentFolder.folderId}`
				: `/appeals-service/appeal-details/${request.params.appealId}/costs/${costsCategory}/${costsDocumentType}/manage-documents/${currentFolder.folderId}`,
		uploadUpdatedDocumentUrl:
			costsCategory === 'decision'
				? `/appeals-service/appeal-details/${currentAppeal.appealId}/costs/decision/upload-documents/${currentFolder?.folderId}/{{documentId}}`
				: `/appeals-service/appeal-details/${currentAppeal.appealId}/costs/${costsCategory}/${costsDocumentType}/upload-documents/${currentFolder?.folderId}/{{documentId}}`,
		removeDocumentUrl:
			costsCategory === 'decision'
				? `/appeals-service/appeal-details/${request.params.appealId}/costs/decision/manage-documents/${currentFolder.folderId}/{{documentId}}/{{versionId}}/delete`
				: `/appeals-service/appeal-details/${request.params.appealId}/costs/${costsCategory}/${costsDocumentType}/manage-documents/${currentFolder.folderId}/{{documentId}}/{{versionId}}/delete`,
		...(costsCategory === 'decision' && {
			pageTitleTextOverride: 'Manage decision document'
		}),
		...(costsCategory === 'decision' && {
			dateRowLabelTextOverride: 'Decision date'
		})
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getDeleteCostsDocument = async (request, response) => {
	const {
		currentFolder,
		params: { costsCategory, costsDocumentType }
	} = request;

	if (!currentFolder) {
		return response.status(404).render('app/404.njk');
	}

	await renderDeleteDocument({
		request,
		response,
		backButtonUrl:
			costsCategory === 'decision'
				? `/appeals-service/appeal-details/${request.params.appealId}/costs/decision/manage-documents/${currentFolder.folderId}/{{documentId}}`
				: `/appeals-service/appeal-details/${request.params.appealId}/costs/${costsCategory}/${costsDocumentType}/manage-documents/${currentFolder.folderId}/{{documentId}}`
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postDeleteCostsDocument = async (request, response) => {
	const {
		currentAppeal,
		currentFolder,
		params: { costsCategory, costsDocumentType }
	} = request;

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404.njk');
	}

	await postDeleteDocument({
		request,
		response,
		returnUrl: `/appeals-service/appeal-details/${request.params.appealId}`,
		cancelUrl:
			costsCategory === 'decision'
				? `/appeals-service/appeal-details/${request.params.appealId}/costs/decision/manage-documents/{{folderId}}/{{documentId}}`
				: `/appeals-service/appeal-details/${request.params.appealId}/costs/${costsCategory}/${costsDocumentType}/manage-documents/{{folderId}}/{{documentId}}`,
		uploadNewDocumentUrl:
			costsCategory === 'decision'
				? `/appeals-service/appeal-details/${currentAppeal.appealId}/costs/decision/upload-documents/{{folderId}}`
				: `/appeals-service/appeal-details/${currentAppeal.appealId}/costs/${costsCategory}/${costsDocumentType}/upload-documents/{{folderId}}`
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getChangeDocumentFileNameDetails = async (request, response) => {
	await renderChangeDocumentFileName({
		request,
		response,
		backButtonUrl:
			request.params.costsCategory === 'decision'
				? `/appeals-service/appeal-details/${request.params.appealId}/costs/decision/manage-documents/${request.params.folderId}/${request.params.documentId}`
				: `/appeals-service/appeal-details/${request.params.appealId}/costs/${request.params.costsCategory}/${request.params.costsDocumentType}/manage-documents/${request.params.folderId}/${request.params.documentId}`
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postChangeDocumentFileNameDetails = async (request, response) => {
	await postChangeDocumentFileName({
		request,
		response,
		backButtonUrl:
			request.params.costsCategory === 'decision'
				? `/appeals-service/appeal-details/${request.params.appealId}/costs/decision/manage-documents/${request.params.folderId}/${request.params.documentId}`
				: `/appeals-service/appeal-details/${request.params.appealId}/costs/${request.params.costsCategory}/${request.params.costsDocumentType}/manage-documents/${request.params.folderId}/${request.params.documentId}`,
		nextPageUrl:
			request.params.costsCategory === 'decision'
				? `/appeals-service/appeal-details/${request.params.appealId}/costs/decision/manage-documents/${request.params.folderId}/${request.params.documentId}`
				: `/appeals-service/appeal-details/${request.params.appealId}/costs/${request.params.costsCategory}/${request.params.costsDocumentType}/manage-documents/${request.params.folderId}/${request.params.documentId}`
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getChangeDocumentVersionDetails = async (request, response) => {
	await renderChangeDocumentDetails({
		request,
		response,
		backButtonUrl:
			request.params.costsCategory === 'decision'
				? `/appeals-service/appeal-details/${request.params.appealId}/costs/decision/manage-documents/${request.params.folderId}/${request.params.documentId}`
				: `/appeals-service/appeal-details/${request.params.appealId}/costs/${request.params.costsCategory}/${request.params.costsDocumentType}/manage-documents/${request.params.folderId}/${request.params.documentId}`
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postChangeDocumentVersionDetails = async (request, response) => {
	await postChangeDocumentDetails({
		request,
		response,
		backButtonUrl:
			request.params.costsCategory === 'decision'
				? `/appeals-service/appeal-details/${request.params.appealId}/costs/decision/manage-documents/${request.params.folderId}/${request.params.documentId}`
				: `/appeals-service/appeal-details/${request.params.appealId}/costs/${request.params.costsCategory}/${request.params.costsDocumentType}/manage-documents/${request.params.folderId}/${request.params.documentId}`,
		nextPageUrl:
			request.params.costsCategory === 'decision'
				? `/appeals-service/appeal-details/${request.params.appealId}/costs/decision/manage-documents/${request.params.folderId}/${request.params.documentId}`
				: `/appeals-service/appeal-details/${request.params.appealId}/costs/${request.params.costsCategory}/${request.params.costsDocumentType}/manage-documents/${request.params.folderId}/${request.params.documentId}`
	});
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const renderDecisionCheckAndConfirm = async (request, response) => {
	const {
		errors,
		currentAppeal,
		currentFolder,
		session,
		params: { documentId }
	} = request;

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404.njk');
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

		const { latestDocumentVersion, name } = fileInfo;

		if (!latestDocumentVersion || !name) {
			return response.status(500).render('app/500.njk');
		}

		documentVersion = latestDocumentVersion.version + 1;
		documentFileName = name;
	}

	const mappedPageContent = decisionCheckAndConfirmPage(
		currentAppeal,
		currentFolder,
		session.fileUploadInfo.files,
		redactionStatuses,
		documentId,
		documentVersion,
		documentFileName
	);

	return response.status(200).render('patterns/check-and-confirm-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getDecisionCheckAndConfirm = async (request, response) => {
	renderDecisionCheckAndConfirm(request, response);
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postDecisionCheckAndConfirm = async (request, response) => {
	const {
		session,
		errors,
		currentAppeal,
		currentFolder,
		params: { documentId }
	} = request;

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404.njk');
	}

	if (errors) {
		return renderDecisionCheckAndConfirm(request, response);
	}

	if (documentId) {
		await postUploadDocumentVersionCheckAndConfirm({ request, response });
	} else {
		await postUploadDocumentsCheckAndConfirm({ request, response });
	}

	if (!documentId) {
		addNotificationBannerToSession({
			session,
			bannerDefinitionKey: 'costsDocumentAdded',
			appealId: currentAppeal.appealId,
			text: 'Costs decision uploaded'
		});
	}

	return response.redirect(`/appeals-service/appeal-details/${currentAppeal.appealId}`);
};
