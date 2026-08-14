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
import {
	getDocumentFileType,
	getFileVersionsInfo,
	updateDocument
} from '#appeals/appeal-documents/appeal.documents.service.js';
import logger from '#lib/logger.js';
import { mapFolderNameToDisplayLabel } from '#lib/mappers/utils/documents-and-folders.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { capitalizeFirstLetter } from '@pins/appeals/utils/string-case.js';
import { APPEAL_DOCUMENT_TYPE } from '@planning-inspectorate/data-model';
import {
	inviteResponsesPage,
	shareDocumentCheckAndConfirmPage
} from './supporting-documents.mapper.js';

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getDocumentUpload = async (request, response) => {
	const { currentAppeal, currentFolder } = request;

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404.njk');
	}

	const uploadPageHeadingText = `Upload supporting document`;
	const documentTitle = `supporting document`;

	await renderDocumentUpload({
		request,
		response,
		appealDetails: currentAppeal,
		backButtonUrl: `/appeals-service/appeal-details/${currentAppeal.appealId}`,
		documentTitle: documentTitle,
		nextPageUrl: `/appeals-service/appeal-details/${currentAppeal.appealId}/supporting-documents/add-document-details/${currentFolder.folderId}`,
		pageHeadingTextOverride: uploadPageHeadingText,
		documentType: APPEAL_DOCUMENT_TYPE.GENERAL_SUPPORTING
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postDocumentUploadPage = async (request, response) => {
	const { currentAppeal, currentFolder } = request;

	await postDocumentUpload({
		request,
		response,
		nextPageUrl: `/appeals-service/appeal-details/${currentAppeal.appealId}/supporting-documents/add-document-details/${currentFolder.folderId}`
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getDocumentVersionUpload = async (request, response) => {
	const {
		apiClient,
		currentAppeal,
		currentFolder,
		params: { documentId }
	} = request;

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404.njk');
	}

	const [pageHeading, uploadContainerHeading] = (() => {
		const headingText = `Supporting documents`;

		return [capitalizeFirstLetter(headingText), `Upload ${headingText}`];
	})();

	const allowedType = await getDocumentFileType(apiClient, documentId);

	await renderDocumentUpload({
		request,
		response,
		appealDetails: currentAppeal,
		backButtonUrl: `/appeals-service/appeal-details/${currentAppeal.appealId}/supporting-documents/manage-documents/${currentFolder.folderId}/${documentId}`,
		nextPageUrl: `/appeals-service/appeal-details/${currentAppeal.appealId}/supporting-documents/add-document-details/${currentFolder.folderId}/${documentId}`,
		allowMultipleFiles: true,
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
		params: { documentId }
	} = request;

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404');
	}

	await postDocumentUpload({
		request,
		response,
		nextPageUrl: `/appeals-service/appeal-details/${currentAppeal.appealId}/supporting-documents/add-document-details/${currentFolder.folderId}/${documentId}`
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

	const categoryLabel = `Supporting document`;

	const documentIdFragment = documentId ? `/${documentId}` : '';

	await renderDocumentDetails({
		request,
		response,
		backLinkUrl: `/appeals-service/appeal-details/${currentAppeal.appealId}/supporting-documents/upload-documents/${currentFolder?.folderId}${documentIdFragment}`,
		pageHeadingTextOverride: categoryLabel,
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

	let categoryLabel = `Supporting document`;

	const documentIdFragment = documentId ? `/${documentId}` : '';

	await postDocumentDetails({
		request,
		response,
		backLinkUrl: `/appeals-service/appeal-details/${currentAppeal.appealId}/supporting-documents/upload-documents/${currentFolder?.folderId}`,
		nextPageUrl: `/appeals-service/appeal-details/${currentAppeal.appealId}/supporting-documents/check-your-answers/${currentFolder?.folderId}${documentIdFragment}`,
		pageHeadingTextOverride: categoryLabel
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

	const addDocumentDetailsPageUrl = `/appeals-service/appeal-details/${
		currentAppeal.appealId
	}/supporting-documents/add-document-details/${currentFolder.folderId}${
		documentId ? `/${documentId}` : ''
	}`;

	await renderUploadDocumentsCheckAndConfirm({
		request,
		response,
		backLinkUrl: addDocumentDetailsPageUrl,
		changeFileLinkUrl: `/appeals-service/appeal-details/${
			request.currentAppeal.appealId
		}/supporting-documents/upload-documents/${currentFolder.folderId}${
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
			successCallback: () => {
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
			error instanceof Error
				? error.message
				: 'Something went wrong when adding supporting document'
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
				: 'Something went wrong when adding supporting document version'
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

	const categoryLabel = `Supporting documents`;

	await renderManageFolder({
		request,
		response,
		backLinkUrl: `/appeals-service/appeal-details/${request.params.appealId}`,
		viewAndEditUrl: `/appeals-service/appeal-details/${request.params.appealId}/supporting-documents/manage-documents/${currentFolder.folderId}/{{documentId}}`,
		addButtonUrl: `/appeals-service/appeal-details/${request.params.appealId}/supporting-documents/upload-documents/${currentFolder.folderId}`,
		pageHeadingTextOverride: categoryLabel,
		canShare: true,
		shareAllLinkUrl: `/appeals-service/appeal-details/${request.params.appealId}/supporting-documents/manage-documents/${currentFolder.folderId}/share-all`
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
		backLinkUrl: `/appeals-service/appeal-details/${request.params.appealId}/supporting-documents/manage-documents/${currentFolder.folderId}`,
		uploadUpdatedDocumentUrl: `/appeals-service/appeal-details/${currentAppeal.appealId}/supporting-documents/upload-documents/${currentFolder?.folderId}/{{documentId}}`,
		removeDocumentUrl: `/appeals-service/appeal-details/${request.params.appealId}/supporting-documents/manage-documents/${currentFolder.folderId}/{{documentId}}/{{versionId}}/delete`,
		canShare: true
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getDeleteSupportingDocument = async (request, response) => {
	const { currentFolder } = request;

	if (!currentFolder) {
		return response.status(404).render('app/404.njk');
	}

	await renderDeleteDocument({
		request,
		response,
		backButtonUrl: `/appeals-service/appeal-details/${request.params.appealId}/supporting-documents/manage-documents/${currentFolder.folderId}/{{documentId}}`
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postDeleteSupportingDocument = async (request, response) => {
	const { currentAppeal, currentFolder } = request;

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404.njk');
	}

	await postDeleteDocument({
		request,
		response,
		returnUrl: `/appeals-service/appeal-details/${request.params.appealId}`,
		cancelUrl: `/appeals-service/appeal-details/${request.params.appealId}/supporting-documents/manage-documents/{{folderId}}/{{documentId}}`,
		uploadNewDocumentUrl: `/appeals-service/appeal-details/${currentAppeal.appealId}/supporting-documents/upload-documents/{{folderId}}`
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getChangeDocumentFileNameDetails = async (request, response) => {
	await renderChangeDocumentFileName({
		request,
		response,
		backButtonUrl: `/appeals-service/appeal-details/${request.params.appealId}/supporting-documents/manage-documents/${request.params.folderId}/${request.params.documentId}`
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postChangeDocumentFileNameDetails = async (request, response) => {
	await postChangeDocumentFileName({
		request,
		response,
		backButtonUrl: `/appeals-service/appeal-details/${request.params.appealId}/supporting-documents/manage-documents/${request.params.folderId}/${request.params.documentId}`,
		nextPageUrl: `/appeals-service/appeal-details/${request.params.appealId}/supporting-documents/manage-documents/${request.params.folderId}/${request.params.documentId}`
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getChangeDocumentVersionDetails = async (request, response) => {
	await renderChangeDocumentDetails({
		request,
		response,
		backButtonUrl: `/appeals-service/appeal-details/${request.params.appealId}/supporting-documents/manage-documents/${request.params.folderId}/${request.params.documentId}`
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postChangeDocumentVersionDetails = async (request, response) => {
	await postChangeDocumentDetails({
		request,
		response,
		backButtonUrl: `/appeals-service/appeal-details/${request.params.appealId}/supporting-documents/manage-documents/${request.params.folderId}/${request.params.documentId}`,
		nextPageUrl: `/appeals-service/appeal-details/${request.params.appealId}/supporting-documents/manage-documents/${request.params.folderId}/${request.params.documentId}`
	});
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getInviteResponses = async (request, response) => {
	const { appealId, folderId, documentId } = request.params;
	const backLinkUrl = `/appeals-service/appeal-details/${appealId}/supporting-documents/manage-documents/${folderId}/${documentId}`;

	if (request.session.appealId && request.session.appealId !== appealId) {
		delete request.session.appealId;
		delete request.session.inviteResponses;
	}

	const inviteResponses =
		appealId === request.session.appealId ? request.session.inviteResponses : undefined;
	const pageContent = inviteResponsesPage(backLinkUrl, inviteResponses);

	return response.render('patterns/change-page.pattern.njk', {
		pageContent,
		errors: request.errors
	});
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postInviteResponses = async (request, response) => {
	const { errors, body } = request;
	const { appealId, folderId, documentId } = request.params;

	if (errors) {
		return getInviteResponses(request, response);
	}

	request.session.inviteResponses = body['invite-responses'];
	request.session.appealId = appealId;

	return response.redirect(
		`/appeals-service/appeal-details/${appealId}/supporting-documents/manage-documents/${folderId}/${documentId}/check-your-answers`
	);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getShareDocumentCheckAndConfirm = async (request, response) => {
	const { appealId, folderId, documentId } = request.params;
	const session = request.session;
	// const { currentAppeal } = request;
	const documentInfo = await getFileVersionsInfo(request.apiClient, documentId);
	if (!documentInfo || !documentInfo.latestDocumentVersion) {
		return response.status(404).render('app/404.njk');
	}

	const backLinkUrl = `/appeals-service/appeal-details/${appealId}/supporting-documents/manage-documents/${folderId}/${documentId}/invite-responses`;

	// const { email } = await getTeamFromAppealId(request.apiClient, appealId);
	// const address = appealSiteToAddressString(currentAppeal?.appealSite);
	// const deadline = format(addWeeks(new Date(), 1), 'd MMMM yyyy');
	// let notifyTemplateName = '';

	// const inviteResponses = session?.inviteResponses?.toLowerCase() === 'yes';

	// const notifyPreview = await generateNotifyPreview(request.apiClient, notifyTemplateName, {
	// 	appeal_reference_number: currentAppeal?.appealReference,
	// 	site_address: address || '',
	// 	lpa_reference: currentAppeal?.planningApplicationReference || '',
	// 	enforcement_reference: currentAppeal.enforcementNotice?.appellantCase?.reference || '',
	// 	contact_email: email || '',
	// 	deadline: deadline,
	// 	responses_invited: inviteResponses,
	// 	dashboard_link: 'appeals'
	// });

	const pageContent = shareDocumentCheckAndConfirmPage(
		backLinkUrl,
		documentInfo.latestDocumentVersion,
		null,
		session.inviteResponses
	);

	return response.render('patterns/change-page.pattern.njk', {
		pageContent,
		errors: request.errors
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postShareDocumentCheckAndConfirm = async (request, response) => {
	const { appealId, documentId } = request.params;
	try {
		/** @type {import('#appeals/appeal-documents/appeal.documents.service.js').DocumentDetailAPIPatchRequest} */
		const apiRequest = {
			document: {
				id: documentId,
				isShared: true
			},
			inviteResponses: request.session?.inviteResponses === 'yes',
			sharingDocumentType: `supporting-document`
		};

		await updateDocument(request.apiClient, appealId, apiRequest);
	} catch (error) {
		logger.error(
			error,
			error instanceof Error
				? error.message
				: 'Something went wrong when marking document as shared'
		);
	}

	delete request.session.inviteResponses;

	addNotificationBannerToSession({
		session: request.session,
		bannerDefinitionKey: 'documentAdded',
		appealId: appealId,
		text: 'Document shared'
	});

	return response.redirect(`/appeals-service/appeal-details/${appealId}`);
};
