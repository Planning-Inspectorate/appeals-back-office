import { addDocumentTypePage } from './costs.mapper.js';
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
	const { errors, currentAppeal, session } = request;

	if (!currentAppeal) {
		return response.status(404).render('app/404');
	}
	if (session.costsDocumentType) {
		delete session.costsDocumentType;
	}

	// TODO: BOAT-1168 - add API endpoint to retrieve document type options (hardcoded for now)
	const documentTypes = [
		{
			id: 1,
			name: 'Application'
		},
		{
			id: 2,
			name: 'Withdrawal'
		},
		{
			id: 3,
			name: 'Correspondence'
		}
	];

	const mappedPageContent = addDocumentTypePage(request.currentAppeal, documentTypes);

	return response.render('patterns/change-page.pattern.njk', {
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
		params: { costsApplicant }
	} = request;

	if (!currentAppeal) {
		return response.status(404).render('app/404');
	}
	if (!currentFolder) {
		return response.status(404).render('app/500');
	}

	if (errors) {
		return renderSelectDocumentType(request, response);
	}

	const documentType = body['costs-document-type'];

	session.costsDocumentType = documentType;

	return response.redirect(
		`/appeals-service/appeal-details/${currentAppeal.appealId}/costs/${costsApplicant}/upload-documents/${currentFolder?.id}`
	);
};

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getDocumentUpload = async (request, response) => {
	const {
		session,
		currentAppeal,
		currentFolder,
		params: { costsApplicant }
	} = request;

	if (!currentAppeal) {
		return response.status(404).render('app/404');
	}
	if (!currentFolder) {
		return response.status(404).render('app/500');
	}
	if (!objectContainsAllKeys(session, 'costsDocumentType')) {
		return response.status(404).render('app/500');
	}

	renderDocumentUpload(
		request,
		response,
		currentAppeal,
		`/appeals-service/appeal-details/${currentAppeal.appealId}/costs/${costsApplicant}/select-document-type/${currentFolder.id}`,
		`/appeals-service/appeal-details/${currentAppeal.appealId}/costs/${costsApplicant}/add-document-details/${currentFolder.id}`,
		false,
		`Upload ${costsApplicant === 'lpa' ? 'LPA' : costsApplicant} costs document`,
		false,
		session.costsDocumentType
	);
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getDocumentVersionUpload = async (request, response) => {
	const {
		currentAppeal,
		currentFolder,
		params: { costsApplicant }
	} = request;

	if (!currentAppeal) {
		return response.status(404).render('app/404');
	}
	if (!currentFolder) {
		return response.status(404).render('app/500');
	}

	renderDocumentUpload(
		request,
		response,
		currentAppeal,
		`/appeals-service/appeal-details/${currentAppeal.appealId}/costs/${costsApplicant}/select-document-type/${currentFolder.id}`,
		`/appeals-service/appeal-details/${currentAppeal.appealId}/costs/${costsApplicant}/add-document-details/${currentFolder.id}`,
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
		params: { costsApplicant }
	} = request;

	if (!currentAppeal) {
		return response.status(404).render('app/404');
	}
	if (!currentFolder) {
		return response.status(404).render('app/500');
	}

	let costsApplicantLabel = capitalize(costsApplicant);

	if (costsApplicant === 'lpa') {
		costsApplicantLabel = 'LPA';
	}

	addNotificationBannerToSession(
		session,
		'costsDocumentAdded',
		currentAppeal.appealId,
		'',
		`${costsApplicantLabel} costs document uploaded`
	);

	renderDocumentDetails(
		request,
		response,
		`/appeals-service/appeal-details/${currentAppeal.appealId}/costs/${costsApplicant}/upload-documents/${currentFolder?.id}`,
		false,
		`${costsApplicantLabel} costs document`
	);
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postAddDocumentDetails = async (request, response) => {
	const {
		currentAppeal,
		currentFolder,
		params: { costsApplicant }
	} = request;

	if (!currentAppeal) {
		return response.status(404).render('app/404');
	}
	if (!currentFolder) {
		return response.status(404).render('app/500');
	}

	let costsApplicantLabel = capitalize(costsApplicant);

	if (costsApplicant === 'lpa') {
		costsApplicantLabel = 'LPA';
	}

	postDocumentDetails(
		request,
		response,
		`/appeals-service/appeal-details/${currentAppeal.appealId}/costs/${costsApplicant}/upload-documents/${currentFolder?.id}`,
		`/appeals-service/appeal-details/${request.params.appealId}`,
		`${costsApplicantLabel} costs document`,
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
		params: { costsApplicant }
	} = request;

	if (!currentAppeal) {
		return response.status(404).render('app/404');
	}
	if (!currentFolder) {
		return response.status(404).render('app/500');
	}

	let costsApplicantLabel = capitalize(costsApplicant);

	if (costsApplicant === 'lpa') {
		costsApplicantLabel = 'LPA';
	}

	renderManageFolder(
		request,
		response,
		`/appeals-service/appeal-details/${request.params.appealId}`,
		`/appeals-service/appeal-details/${request.params.appealId}/costs/${costsApplicant}/manage-documents/${currentFolder.id}/{{documentId}}`,
		`${costsApplicantLabel} costs documents`
	);
};

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getManageDocument = async (request, response) => {
	const {
		currentAppeal,
		currentFolder,
		params: { costsApplicant }
	} = request;

	if (!currentAppeal) {
		return response.status(404).render('app/404');
	}
	if (!currentFolder) {
		return response.status(404).render('app/500');
	}

	renderManageDocument(
		request,
		response,
		`/appeals-service/appeal-details/${request.params.appealId}/costs/${costsApplicant}/manage-documents/${currentFolder.id}`,
		`/appeals-service/appeal-details/${currentAppeal.appealId}/costs/${costsApplicant}/upload-documents/${currentFolder?.id}/{{documentId}}`,
		`/appeals-service/appeal-details/${request.params.appealId}/costs/${costsApplicant}/manage-documents/${currentFolder.id}/{{documentId}}/{{versionId}}/delete`
	);
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getDeleteCostsDocument = async (request, response) => {
	const {
		currentFolder,
		params: { costsApplicant }
	} = request;

	if (!currentFolder) {
		return response.status(404).render('app/500');
	}

	renderDeleteDocument(
		request,
		response,
		`/appeals-service/appeal-details/${request.params.appealId}/costs/${costsApplicant}/manage-documents/${currentFolder.id}/{{documentId}}`
	);
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postDeleteCostsDocument = async (request, response) => {
	const {
		currentAppeal,
		currentFolder,
		params: { costsApplicant }
	} = request;

	if (!currentAppeal) {
		return response.status(404).render('app/404');
	}
	if (!currentFolder) {
		return response.status(404).render('app/500');
	}

	postDocumentDelete(
		request,
		response,
		`/appeals-service/appeal-details/${request.params.appealId}`,
		`/appeals-service/appeal-details/${currentAppeal.appealId}/costs/${costsApplicant}/upload-documents/${currentFolder?.id}/{{documentId}}`
	);
};
