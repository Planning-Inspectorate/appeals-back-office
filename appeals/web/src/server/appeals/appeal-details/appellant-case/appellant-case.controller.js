import logger from '#lib/logger.js';
import * as appellantCaseService from './appellant-case.service.js';
import {
	appellantCasePage,
	mapWebReviewOutcomeToApiReviewOutcome,
	checkAndConfirmPage,
	getValidationOutcomeFromAppellantCase,
	getPageHeadingTextOverrideForFolder,
	getPageHeadingTextOverrideForAddDocuments,
	getDocumentNameFromFolder
} from './appellant-case.mapper.js';
import { objectContainsAllKeys } from '#lib/object-utilities.js';
import {
	postChangeDocumentDetails,
	postDeleteDocument,
	postDocumentDetails,
	renderUploadDocumentsCheckAndConfirm,
	postUploadDocumentsCheckAndConfirm,
	postUploadDocumentVersionCheckAndConfirm,
	renderChangeDocumentDetails,
	renderDeleteDocument,
	renderDocumentDetails,
	renderDocumentUpload,
	postDocumentUpload,
	renderManageDocument,
	renderManageFolder,
	renderChangeDocumentFileName,
	postChangeDocumentFileName
} from '../../appeal-documents/appeal-documents.controller.js';
import { getDocumentFileType } from '#appeals/appeal-documents/appeal.documents.service.js';
import { capitalize } from 'lodash-es';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { mapFolderNameToDisplayLabel } from '#lib/mappers/utils/documents-and-folders.js';
import { getBackLinkUrlFromQuery, stripQueryString } from '#lib/url-utilities.js';

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
			stripQueryString(request.originalUrl),
			getBackLinkUrlFromQuery(request),
			request.session
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
			addNotificationBannerToSession({
				session: request.session,
				bannerDefinitionKey: 'appellantCaseInvalidOrIncomplete',
				appealId: currentAppeal.appealId,
				text: `Appeal ${validationOutcome}`
			});

			return response.redirect(`/appeals-service/appeal-details/${appealId}`);
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
	const { currentAppeal, currentFolder } = request;

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404.njk');
	}

	const appellantCaseDetails = await getAppellantCaseDetails(request, response, currentAppeal);

	if (!appellantCaseDetails) {
		return response.status(404).render('app/404.njk');
	}
	const pageHeadingTextOverride = getPageHeadingTextOverrideForAddDocuments(currentFolder);
	await renderDocumentUpload({
		request,
		response,
		appealDetails: currentAppeal,
		backButtonUrl: `/appeals-service/appeal-details/${request.params.appealId}/appellant-case/`,
		nextPageUrl: `/appeals-service/appeal-details/${request.params.appealId}/appellant-case/add-document-details/{{folderId}}`,
		isLateEntry: getValidationOutcomeFromAppellantCase(appellantCaseDetails) === 'valid',
		pageHeadingTextOverride,
		documentTitle: getDocumentNameFromFolder(currentFolder.path) || ''
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postAddDocuments = async (request, response) => {
	const { currentAppeal, currentFolder } = request;

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404');
	}

	await postDocumentUpload({
		request,
		response,
		nextPageUrl: `/appeals-service/appeal-details/${currentAppeal.appealId}/appellant-case/add-document-details/${currentFolder.folderId}`
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getAddDocumentDetails = async (request, response) => {
	const { currentAppeal, currentFolder } = request;

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404.njk');
	}

	const appellantCaseDetails = await getAppellantCaseDetails(request, response, currentAppeal);
	if (!appellantCaseDetails) {
		return response.status(404).render('app/404.njk');
	}

	const headingTextOverride = getPageHeadingTextOverrideForFolder(currentFolder);

	await renderDocumentDetails({
		request,
		response,
		backLinkUrl: `/appeals-service/appeal-details/${request.params.appealId}/appellant-case/add-documents/{{folderId}}`,
		isLateEntry: getValidationOutcomeFromAppellantCase(appellantCaseDetails) === 'valid',
		...(headingTextOverride && {
			pageHeadingTextOverride: capitalize(headingTextOverride)
		})
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postAddDocumentDetails = async (request, response) => {
	await postDocumentDetails({
		request,
		response,
		backLinkUrl: `/appeals-service/appeal-details/${request.params.appealId}/appellant-case/add-documents/{{folderId}}`,
		nextPageUrl: `/appeals-service/appeal-details/${request.params.appealId}/appellant-case/add-documents/{{folderId}}/check-your-answers`
	});
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

	const addDocumentDetailsPageUrl = `/appeals-service/appeal-details/${
		request.currentAppeal.appealId
	}/appellant-case/add-document-details/${currentFolder.folderId}${
		documentId ? `/${documentId}` : ''
	}`;

	await renderUploadDocumentsCheckAndConfirm({
		request,
		response,
		backLinkUrl: addDocumentDetailsPageUrl,
		changeFileLinkUrl: `/appeals-service/appeal-details/${
			request.currentAppeal.appealId
		}/appellant-case/add-documents/${currentFolder.folderId}${documentId ? `/${documentId}` : ''}`,
		changeDateLinkUrl: addDocumentDetailsPageUrl,
		changeRedactionStatusLinkUrl: addDocumentDetailsPageUrl
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postAddDocumentsCheckAndConfirm = async (request, response) => {
	const { currentAppeal, currentFolder } = request;

	if (!currentAppeal) {
		return response.status(404).render('app/404');
	}

	try {
		await postUploadDocumentsCheckAndConfirm({
			request,
			response,
			nextPageUrl: `/appeals-service/appeal-details/${currentAppeal.appealId}/appellant-case`,
			successCallback: () => {
				addNotificationBannerToSession({
					session: request.session,
					bannerDefinitionKey: 'documentAdded',
					appealId: currentAppeal.appealId,
					text: `${
						mapFolderNameToDisplayLabel({ folderPath: currentFolder?.path, capitalise: true }) ||
						'Documents'
					} added`
				});
			}
		});
	} catch (error) {
		logger.error(
			error,
			error instanceof Error
				? error.message
				: 'Something went wrong when adding documents to appellant case'
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
		await postUploadDocumentVersionCheckAndConfirm({
			request,
			response,
			nextPageUrl: `/appeals-service/appeal-details/${currentAppeal.appealId}/appellant-case`
		});
	} catch (error) {
		logger.error(
			error,
			error instanceof Error
				? error.message
				: 'Something went wrong when adding document version to appellant case'
		);

		return response.render('app/500.njk');
	}
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getManageFolder = async (request, response) => {
	const { currentFolder } = request;

	if (!currentFolder) {
		return response.status(404).render('app/404');
	}

	const headingTextOverride = getPageHeadingTextOverrideForFolder(currentFolder);

	await renderManageFolder({
		request,
		response,
		backLinkUrl: `/appeals-service/appeal-details/${request.params.appealId}/appellant-case/`,
		viewAndEditUrl: `/appeals-service/appeal-details/${request.params.appealId}/appellant-case/manage-documents/{{folderId}}/{{documentId}}`,
		addButtonUrl: `/appeals-service/appeal-details/${request.params.appealId}/appellant-case/add-documents/{{folderId}}`,
		...(headingTextOverride && {
			pageHeadingTextOverride: capitalize(headingTextOverride)
		})
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getManageDocument = async (request, response) => {
	await renderManageDocument({
		request,
		response,
		backLinkUrl: `/appeals-service/appeal-details/${request.params.appealId}/appellant-case/manage-documents/{{folderId}}`,
		uploadUpdatedDocumentUrl: `/appeals-service/appeal-details/${request.params.appealId}/appellant-case/add-documents/{{folderId}}/{{documentId}}`,
		removeDocumentUrl: `/appeals-service/appeal-details/${request.params.appealId}/appellant-case/manage-documents/{{folderId}}/{{documentId}}/{{versionId}}/delete`
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getAddDocumentVersion = async (request, response) => {
	const { apiClient, currentAppeal, currentFolder } = request;

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404.njk');
	}

	const appellantCaseDetails = await getAppellantCaseDetails(request, response, currentAppeal);
	if (!appellantCaseDetails) {
		return response.status(404).render('app/404.njk');
	}

	const allowedType = await getDocumentFileType(
		apiClient,
		currentAppeal.appealId,
		request.params.documentId
	);

	await renderDocumentUpload({
		request,
		response,
		appealDetails: currentAppeal,
		backButtonUrl: `/appeals-service/appeal-details/${request.params.appealId}/appellant-case/manage-documents/${request.params.folderId}/${request.params.documentId}`,
		nextPageUrl: `/appeals-service/appeal-details/${request.params.appealId}/appellant-case/add-document-details/${request.params.folderId}/${request.params.documentId}`,
		isLateEntry: getValidationOutcomeFromAppellantCase(appellantCaseDetails) === 'valid',
		allowedTypes: allowedType ? [allowedType] : undefined
	});
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

	await postDocumentUpload({
		request,
		response,
		nextPageUrl: `/appeals-service/appeal-details/${currentAppeal.appealId}/appellant-case/add-document-details/${currentFolder.folderId}/${documentId}`
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getAddDocumentVersionDetails = async (request, response) => {
	const {
		currentAppeal,
		currentFolder,
		params: { documentId }
	} = request;

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404.njk');
	}

	const appellantCaseDetails = await getAppellantCaseDetails(request, response, currentAppeal);
	if (!appellantCaseDetails) {
		return response.status(404).render('app/404.njk');
	}

	const headingTextOverride = getPageHeadingTextOverrideForFolder(currentFolder);

	await renderDocumentDetails({
		request,
		response,
		backLinkUrl: `/appeals-service/appeal-details/${request.params.appealId}/appellant-case/add-documents/${request.params.folderId}/${request.params.documentId}`,
		isLateEntry: getValidationOutcomeFromAppellantCase(appellantCaseDetails) === 'valid',
		documentId,
		...(headingTextOverride && {
			pageHeadingTextOverride: `Updated ${headingTextOverride} document`
		})
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postDocumentVersionDetails = async (request, response) => {
	await postDocumentDetails({
		request,
		response,
		backLinkUrl: `/appeals-service/appeal-details/${request.params.appealId}/appellant-case/add-documents/${request.params.folderId}/${request.params.documentId}`,
		nextPageUrl: `/appeals-service/appeal-details/${request.params.appealId}/appellant-case/add-documents/${request.params.folderId}/${request.params.documentId}/check-your-answers`
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getChangeDocumentFileNameDetails = async (request, response) => {
	await renderChangeDocumentFileName({
		request,
		response,
		backButtonUrl: `/appeals-service/appeal-details/${request.params.appealId}/appellant-case/manage-documents/${request.params.folderId}/${request.params.documentId}`
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postChangeDocumentFileNameDetails = async (request, response) => {
	await postChangeDocumentFileName({
		request,
		response,
		backButtonUrl: `/appeals-service/appeal-details/${request.params.appealId}/appellant-case/manage-documents/${request.params.folderId}/${request.params.documentId}`,
		nextPageUrl: `/appeals-service/appeal-details/${request.params.appealId}/appellant-case/manage-documents/${request.params.folderId}/${request.params.documentId}`
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getChangeDocumentVersionDetails = async (request, response) => {
	await renderChangeDocumentDetails({
		request,
		response,
		backButtonUrl: `/appeals-service/appeal-details/${request.params.appealId}/appellant-case/manage-documents/${request.params.folderId}/${request.params.documentId}`
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postChangeDocumentVersionDetails = async (request, response) => {
	await postChangeDocumentDetails({
		request,
		response,
		backButtonUrl: `/appeals-service/appeal-details/${request.params.appealId}/appellant-case/manage-documents/${request.params.folderId}/${request.params.documentId}`,
		nextPageUrl: `/appeals-service/appeal-details/${request.params.appealId}/appellant-case/manage-documents/${request.params.folderId}/${request.params.documentId}`
	});
};
/** @type {import('@pins/express').RequestHandler<Response>} */
export const getDeleteDocument = async (request, response) => {
	await renderDeleteDocument({
		request,
		response,
		backButtonUrl: `/appeals-service/appeal-details/${request.params.appealId}/appellant-case/manage-documents/{{folderId}}/{{documentId}}`
	});
};
/** @type {import('@pins/express').RequestHandler<Response>} */
export const postDeleteDocumentPage = async (request, response) => {
	await postDeleteDocument({
		request,
		response,
		returnUrl: `/appeals-service/appeal-details/${request.params.appealId}/appellant-case`,
		cancelUrl: `/appeals-service/appeal-details/${request.params.appealId}/appellant-case/manage-documents/{{folderId}}/{{documentId}}`,
		uploadNewDocumentUrl: `/appeals-service/appeal-details/${request.params.appealId}/appellant-case/add-documents/{{folderId}}`
	});
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
