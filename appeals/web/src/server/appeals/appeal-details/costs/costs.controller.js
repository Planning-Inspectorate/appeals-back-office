import { addDocumentTypePage, decisionCheckAndConfirmPage } from './costs.mapper.js';
import {
	renderDocumentUpload,
	renderDocumentDetails,
	postDocumentDetails,
	renderManageFolder,
	renderManageDocument,
	renderDeleteDocument,
	postDocumentDelete
} from '#appeals/appeal-documents/appeal-documents.controller.js';
import { capitalize } from 'lodash-es';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { objectContainsAllKeys } from '#lib/object-utilities.js';

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderSelectDocumentType = async (request, response) => {
	const {
		errors,
		currentAppeal,
		session,
		params: { costsCategory }
	} = request;

	if (!currentAppeal) {
		return response.status(404).render('app/404.njk');
	}
	if (session.costsDocumentType) {
		delete session.costsDocumentType;
	}

	// TODO: BOAT-1168 - add API endpoint to retrieve document type options (hardcoded for now)
	const documentTypes = [
		{
			value: `${costsCategory}CostsApplication`,
			name: 'Application'
		},
		{
			value: `${costsCategory}CostsWithdrawal`,
			name: 'Withdrawal'
		},
		{
			value: `${costsCategory}CostsCorrespondence`,
			name: 'Correspondence'
		}
	];

	const mappedPageContent = addDocumentTypePage(request.currentAppeal, documentTypes);

	return response.status(200).render('patterns/change-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getSelectDocumentType = async (request, response) => {
	renderSelectDocumentType(request, response);
};

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const postSelectDocumentType = async (request, response) => {
	const {
		errors,
		session,
		currentAppeal,
		currentFolder,
		body,
		params: { costsCategory }
	} = request;

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404.njk');
	}

	if (errors) {
		return renderSelectDocumentType(request, response);
	}

	const documentType = body['costs-document-type'];

	session.costsDocumentType = documentType;

	return response.redirect(
		`/appeals-service/appeal-details/${currentAppeal.appealId}/costs/${costsCategory}/upload-documents/${currentFolder?.id}`
	);
};

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getDocumentUpload = async (request, response) => {
	const {
		session,
		currentAppeal,
		currentFolder,
		params: { costsCategory }
	} = request;

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404.njk');
	}

	if (costsCategory !== 'decision' && !objectContainsAllKeys(session, 'costsDocumentType')) {
		return response.status(500).render('app/500.njk');
	}

	let uploadPageHeadingText = '';

	switch (costsCategory) {
		case 'lpa':
			uploadPageHeadingText = 'Upload LPA costs document';
			break;
		case 'decision':
			uploadPageHeadingText = 'Upload costs decision';
			break;
		default:
			uploadPageHeadingText = `Upload ${costsCategory} costs document`;
			break;
	}

	renderDocumentUpload(
		request,
		response,
		currentAppeal,
		`/appeals-service/appeal-details/${currentAppeal.appealId}/costs/${costsCategory}/select-document-type/${currentFolder.id}`,
		`/appeals-service/appeal-details/${currentAppeal.appealId}/costs/${costsCategory}/add-document-details/${currentFolder.id}`,
		false,
		uploadPageHeadingText,
		costsCategory === 'decision',
		session.costsDocumentType
	);
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getDocumentVersionUpload = async (request, response) => {
	const {
		currentAppeal,
		currentFolder,
		params: { costsCategory, documentId }
	} = request;

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404.njk');
	}

	renderDocumentUpload(
		request,
		response,
		currentAppeal,
		`/appeals-service/appeal-details/${currentAppeal.appealId}/costs/${costsCategory}/select-document-type/${currentFolder.id}`,
		`/appeals-service/appeal-details/${currentAppeal.appealId}/costs/${costsCategory}/add-document-details/${currentFolder.id}/${documentId}`,
		false,
		undefined, // TODO: should the upload new version page have a custom title, and if so what should it be?
		false
	);
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getAddDocumentDetails = async (request, response) => {
	const {
		session,
		currentAppeal,
		currentFolder,
		params: { costsCategory, documentId }
	} = request;

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404.njk');
	}

	let costsCategoryLabel = `${capitalize(costsCategory)} costs document`;

	switch (costsCategory) {
		case 'lpa':
			costsCategoryLabel = 'LPA costs document';
			break;
		case 'decision':
			costsCategoryLabel = 'Costs decision document';
			break;
	}

	addNotificationBannerToSession(
		session,
		'costsDocumentAdded',
		currentAppeal.appealId,
		'',
		`${costsCategoryLabel} uploaded`
	);

	renderDocumentDetails(
		request,
		response,
		`/appeals-service/appeal-details/${
			currentAppeal.appealId
		}/costs/${costsCategory}/upload-documents/${currentFolder?.id}${
			documentId ? `/${documentId}` : ''
		}`,
		false,
		costsCategoryLabel
	);
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postAddDocumentDetails = async (request, response) => {
	const {
		currentAppeal,
		currentFolder,
		params: { costsCategory }
	} = request;

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404.njk');
	}

	let costsCategoryLabel = `${capitalize(costsCategory)} costs document`;

	switch (costsCategory) {
		case 'lpa':
			costsCategoryLabel = 'LPA costs document';
			break;
		case 'decision':
			costsCategoryLabel = 'Costs decision document';
			break;
	}

	postDocumentDetails(
		request,
		response,
		`/appeals-service/appeal-details/${currentAppeal.appealId}/costs/${costsCategory}/upload-documents/${currentFolder?.id}`,
		costsCategory === 'decision'
			? `/appeals-service/appeal-details/${currentAppeal.appealId}/costs/decision/check-and-confirm/${currentFolder?.id}`
			: `/appeals-service/appeal-details/${request.params.appealId}`,
		costsCategoryLabel,
		(/** @type {import('@pins/express/types/express.js').Request} */ request) => {
			if (request.session.costsDocumentType) {
				delete request.session.costsDocumentType;
			}
		}
	);
};

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getManageFolder = async (request, response) => {
	const {
		currentAppeal,
		currentFolder,
		params: { costsCategory }
	} = request;

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404.njk');
	}

	let costsCategoryLabel = `${capitalize(costsCategory)} costs documents`;

	switch (costsCategory) {
		case 'lpa':
			costsCategoryLabel = 'LPA costs documents';
			break;
		case 'decision':
			costsCategoryLabel = 'Costs decision documents';
			break;
	}

	renderManageFolder(
		request,
		response,
		`/appeals-service/appeal-details/${request.params.appealId}`,
		`/appeals-service/appeal-details/${request.params.appealId}/costs/${costsCategory}/manage-documents/${currentFolder.id}/{{documentId}}`,
		costsCategoryLabel
	);
};

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getManageDocument = async (request, response) => {
	const {
		currentAppeal,
		currentFolder,
		params: { costsCategory }
	} = request;

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404.njk');
	}

	renderManageDocument(
		request,
		response,
		`/appeals-service/appeal-details/${request.params.appealId}/costs/${costsCategory}/manage-documents/${currentFolder.id}`,
		`/appeals-service/appeal-details/${currentAppeal.appealId}/costs/${costsCategory}/upload-documents/${currentFolder?.id}/{{documentId}}`,
		`/appeals-service/appeal-details/${request.params.appealId}/costs/${costsCategory}/manage-documents/${currentFolder.id}/{{documentId}}/{{versionId}}/delete`
	);
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getDeleteCostsDocument = async (request, response) => {
	const {
		currentFolder,
		params: { costsCategory }
	} = request;

	if (!currentFolder) {
		return response.status(404).render('app/404.njk');
	}

	renderDeleteDocument(
		request,
		response,
		`/appeals-service/appeal-details/${request.params.appealId}/costs/${costsCategory}/manage-documents/${currentFolder.id}/{{documentId}}`
	);
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postDeleteCostsDocument = async (request, response) => {
	const {
		currentAppeal,
		currentFolder,
		params: { costsCategory }
	} = request;

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404.njk');
	}

	postDocumentDelete(
		request,
		response,
		`/appeals-service/appeal-details/${request.params.appealId}`,
		`/appeals-service/appeal-details/${request.params.appealId}/costs/${costsCategory}/manage-documents/{{folderId}}/{{documentId}}`,
		`/appeals-service/appeal-details/${currentAppeal.appealId}/costs/${costsCategory}/select-document-type/{{folderId}}`
	);
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const renderDecisionCheckAndConfirm = async (request, response) => {
	const { errors, currentAppeal, currentFolder } = request;

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404.njk');
	}

	const mappedPageContent = decisionCheckAndConfirmPage(request.currentAppeal, currentFolder);

	return response.status(200).render('patterns/check-and-confirm-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getDecisionCheckAndConfirm = async (request, response) => {
	renderDecisionCheckAndConfirm(request, response);
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postDecisionCheckAndConfirm = async (request, response) => {
	const { session, errors, currentAppeal, currentFolder } = request;

	if (!currentAppeal || !currentFolder) {
		return response.status(404).render('app/404.njk');
	}

	if (errors) {
		return renderDecisionCheckAndConfirm(request, response);
	}

	addNotificationBannerToSession(
		session,
		'costsDocumentAdded',
		currentAppeal.appealId,
		'',
		`Costs decision uploaded`
	);

	return response.redirect(`/appeals-service/appeal-details/${currentAppeal.appealId}`);
};
