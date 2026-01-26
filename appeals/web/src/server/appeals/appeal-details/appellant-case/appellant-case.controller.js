import { getDocumentFileType } from '#appeals/appeal-documents/appeal.documents.service.js';
import logger from '#lib/logger.js';
import { mapFolderNameToDisplayLabel } from '#lib/mappers/utils/documents-and-folders.js';
import { objectContainsAllKeys } from '#lib/object-utilities.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { capitalizeFirstLetter } from '#lib/string-utilities.js';
import { getBackLinkUrlFromQuery, stripQueryString } from '#lib/url-utilities.js';
import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
import { CHANGE_APPEAL_TYPE_INVALID_REASON } from '@pins/appeals/constants/support.js';
import { APPEAL_CASE_STAGE, APPEAL_DOCUMENT_TYPE } from '@planning-inspectorate/data-model';
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
} from '../../appeal-documents/appeal-documents.controller.js';
import {
	appellantCasePage,
	checkAndConfirmPage,
	getDocumentNameFromFolder,
	getPageHeadingTextOverrideForAddDocuments,
	getPageHeadingTextOverrideForFolder,
	getValidationOutcomeFromAppellantCase,
	mapWebReviewOutcomeToApiReviewOutcome
} from './appellant-case.mapper.js';
import * as appellantCaseService from './appellant-case.service.js';

/**
 *
 * @param {string} folderPath
 * @returns {undefined|string[]}
 */
const allowedFileTypes = (folderPath) => {
	switch (folderPath) {
		case `${APPEAL_CASE_STAGE.APPELLANT_CASE}/${APPEAL_DOCUMENT_TYPE.GROUND_A_FEE_RECEIPT}`:
			return ['doc', 'docx', 'pdf', 'tif', 'jpg', 'png'];
		default:
			return undefined;
	}
};

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
			.catch((error) => {
				return logger.error(error);
			});

		const mappedPageContent = await appellantCasePage(
			appellantCaseResponse,
			currentAppeal,
			stripQueryString(request.originalUrl),
			getBackLinkUrlFromQuery(request),
			request.session,
			errors?.['reviewOutcome'].msg,
			request
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

		const filteredReasonOptions = reasonOptions.filter(
			(reason) => reason.name !== CHANGE_APPEAL_TYPE_INVALID_REASON
		);

		if (!filteredReasonOptions) {
			throw new Error('error retrieving invalid reason options');
		}

		const mappedPageContent = checkAndConfirmPage(
			currentAppeal.appealId,
			currentAppeal.appealReference,
			filteredReasonOptions,
			webAppellantCaseReviewOutcome.validationOutcome,
			request.session,
			webAppellantCaseReviewOutcome.reasons,
			webAppellantCaseReviewOutcome.reasonsText,
			webAppellantCaseReviewOutcome.updatedDueDate,
			webAppellantCaseReviewOutcome.enforcementNoticeInvalid,
			webAppellantCaseReviewOutcome.otherLiveAppeals
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
	return renderAppellantCase(request, response);
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
				if (currentAppeal.appealType === APPEAL_TYPE.ENFORCEMENT_NOTICE) {
					/** @type {import('../appellant-case/appellant-case.types.js').AppellantCaseSessionValidationOutcome} */
					request.session.webAppellantCaseReviewOutcome = {
						...request.session.webAppellantCaseReviewOutcome,
						validationOutcome: 'valid'
					};

					return response.redirect(
						`/appeals-service/appeal-details/${currentAppeal.appealId}/appellant-case/valid/enforcement/ground-a`
					);
				}

				return response.redirect(
					`/appeals-service/appeal-details/${currentAppeal.appealId}/appellant-case/${reviewOutcome}/date`
				);
			} else {
				if (
					currentAppeal.appealType === APPEAL_TYPE.ENFORCEMENT_NOTICE &&
					reviewOutcome === 'invalid'
				) {
					/** @type {import('../appellant-case/appellant-case.types.js').AppellantCaseSessionValidationOutcome} */
					request.session.webAppellantCaseReviewOutcome = {
						...request.session.webAppellantCaseReviewOutcome,
						validationOutcome: 'invalid'
					};

					return response.redirect(
						`/appeals-service/appeal-details/${currentAppeal.appealId}/appellant-case/invalid/enforcement-notice`
					);
				}

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
				webAppellantCaseReviewOutcome.updatedDueDate,
				webAppellantCaseReviewOutcome.enforcementNoticeInvalid,
				webAppellantCaseReviewOutcome.otherLiveAppeals
			)
		);

		const validationOutcome = webAppellantCaseReviewOutcome.validationOutcome;

		delete request.session.webAppellantCaseReviewOutcome;

		if (validationOutcome === 'invalid' || validationOutcome === 'incomplete') {
			addNotificationBannerToSession({
				session: request.session,
				bannerDefinitionKey: 'appellantCaseInvalidOrIncomplete',
				appealId: currentAppeal.appealId,
				text: `Appeal marked as ${validationOutcome}`
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
	const pageHeadingTextOverride = getPageHeadingTextOverrideForAddDocuments(
		currentFolder,
		currentAppeal.appealType
	);
	await renderDocumentUpload({
		request,
		response,
		appealDetails: currentAppeal,
		backButtonUrl: `/appeals-service/appeal-details/${request.params.appealId}/appellant-case/`,
		nextPageUrl: `/appeals-service/appeal-details/${request.params.appealId}/appellant-case/add-document-details/{{folderId}}`,
		isLateEntry: getValidationOutcomeFromAppellantCase(appellantCaseDetails) === 'valid',
		pageHeadingTextOverride,
		documentTitle: getDocumentNameFromFolder(currentFolder.path) || '',
		allowedTypes: allowedFileTypes(currentFolder.path)
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
			pageHeadingTextOverride: capitalizeFirstLetter(headingTextOverride)
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
					text: `${mapFolderNameToDisplayLabel(currentFolder?.path) || 'Documents'} added`
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
			pageHeadingTextOverride: capitalizeFirstLetter(headingTextOverride)
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

	const allowedType = await getDocumentFileType(apiClient, request.params.documentId);

	const documentName = getDocumentNameFromFolder(currentFolder.path);

	await renderDocumentUpload({
		request,
		response,
		appealDetails: currentAppeal,
		backButtonUrl: `/appeals-service/appeal-details/${request.params.appealId}/appellant-case/manage-documents/${request.params.folderId}/${request.params.documentId}`,
		nextPageUrl: `/appeals-service/appeal-details/${request.params.appealId}/appellant-case/add-document-details/${request.params.folderId}/${request.params.documentId}`,
		isLateEntry: getValidationOutcomeFromAppellantCase(appellantCaseDetails) === 'valid',
		allowedTypes: allowedType ? [allowedType] : undefined,
		...(documentName && {
			pageHeadingTextOverride: capitalizeFirstLetter(documentName),
			uploadContainerHeadingTextOverride: `Upload ${documentName}`
		})
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
