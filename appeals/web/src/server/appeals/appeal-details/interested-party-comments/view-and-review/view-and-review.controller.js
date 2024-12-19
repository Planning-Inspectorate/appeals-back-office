import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { COMMENT_STATUS } from '@pins/appeals/constants/common.js';
import {
	reviewInterestedPartyCommentPage,
	viewInterestedPartyCommentPage
} from './view-and-review.mapper.js';
import { patchInterestedPartyCommentStatus } from './view-and-review.service.js';
import {
	postChangeDocumentDetails,
	postChangeDocumentFileName,
	postDeleteDocument,
	renderChangeDocumentDetails,
	renderChangeDocumentFileName,
	renderDeleteDocument,
	renderManageDocument,
	renderManageFolder
} from '#appeals/appeal-documents/appeal-documents.controller.js';
import { render } from '#appeals/appeal-details/representations/common/render.js';

/** @typedef {import("../../appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {import('#appeals/appeal-details/representations/types.js').Representation} Representation */

export const renderViewInterestedPartyComment = render(
	viewInterestedPartyCommentPage,
	'patterns/display-page.pattern.njk'
);

export const renderReviewInterestedPartyComment = render(
	reviewInterestedPartyCommentPage,
	'patterns/change-page.pattern.njk'
);

/**
 * @type {import('@pins/express').RenderHandler<any, any, any>}
 */
export const postReviewInterestedPartyComment = async (request, response, next) => {
	try {
		const {
			errors,
			params: { appealId, commentId },
			body: { status },
			apiClient,
			session
		} = request;

		if (errors) {
			return renderViewInterestedPartyComment(request, response, next);
		}

		if (status === COMMENT_STATUS.VALID_REQUIRES_REDACTION) {
			return response.redirect(
				`/appeals-service/appeal-details/${appealId}/interested-party-comments/${commentId}/redact`
			);
		}

		if (status === COMMENT_STATUS.INVALID) {
			return response.redirect(
				`/appeals-service/appeal-details/${appealId}/interested-party-comments/${commentId}/reject/select-reason`
			);
		}

		await patchInterestedPartyCommentStatus(apiClient, appealId, commentId, status);

		addNotificationBannerToSession(session, 'interestedPartyCommentsValidSuccess', appealId);

		return response.redirect(
			`/appeals-service/appeal-details/${appealId}/interested-party-comments`
		);
	} catch (error) {
		logger.error(error);
		return response.status(500).render('app/500.njk');
	}
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getManageFolder = async (request, response) => {
	const {
		currentFolder,
		params: { appealId, commentId }
	} = request;

	if (!currentFolder) {
		return response.status(404).render('app/404');
	}

	await renderManageFolder({
		request,
		response,
		backLinkUrl: `/appeals-service/appeal-details/${appealId}/interested-party-comments/${commentId}/review`,
		viewAndEditUrl: `/appeals-service/appeal-details/${appealId}/interested-party-comments/${commentId}/manage-documents/{{folderId}}/{{documentId}}`,
		pageHeadingTextOverride: 'Supporting documents',
		dateColumnLabelTextOverride: 'Date submitted'
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getManageDocument = async (request, response) => {
	const {
		params: { commentId }
	} = request;
	await renderManageDocument({
		request,
		response,
		backLinkUrl: `/appeals-service/appeal-details/${request.params.appealId}/interested-party-comments/${commentId}/manage-documents/{{folderId}}`,
		uploadUpdatedDocumentUrl: `/appeals-service/appeal-details/${request.params.appealId}/interested-party-comments/${commentId}/add-documents/{{folderId}}/{{documentId}}`,
		removeDocumentUrl: `/appeals-service/appeal-details/${request.params.appealId}/interested-party-comments/${commentId}/manage-documents/{{folderId}}/{{documentId}}/{{versionId}}/delete`,
		pageTitleTextOverride: 'Manage versions',
		dateRowLabelTextOverride: 'Date submitted'
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getChangeDocumentVersionDetails = async (request, response) => {
	const {
		params: { commentId }
	} = request;

	await renderChangeDocumentDetails({
		request,
		response,
		backButtonUrl: `/appeals-service/appeal-details/${request.params.appealId}/interested-party-comments/${commentId}/manage-documents/${request.params.folderId}/${request.params.documentId}`
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postChangeDocumentVersionDetails = async (request, response) => {
	const {
		params: { commentId }
	} = request;

	await postChangeDocumentDetails({
		request,
		response,
		backButtonUrl: `/appeals-service/appeal-details/${request.params.appealId}/interested-party-comments/${commentId}/manage-documents/${request.params.folderId}/${request.params.documentId}`,
		nextPageUrl: `/appeals-service/appeal-details/${request.params.appealId}/interested-party-comments/${commentId}/manage-documents/${request.params.folderId}/${request.params.documentId}`
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getChangeDocumentFileNameDetails = async (request, response) => {
	const {
		params: { commentId }
	} = request;

	await renderChangeDocumentFileName({
		request,
		response,
		backButtonUrl: `/appeals-service/appeal-details/${request.params.appealId}/interested-party-comments/${commentId}/manage-documents/${request.params.folderId}/${request.params.documentId}`
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postChangeDocumentFileNameDetails = async (request, response) => {
	const {
		params: { commentId }
	} = request;

	await postChangeDocumentFileName({
		request,
		response,
		backButtonUrl: `/appeals-service/appeal-details/${request.params.appealId}/interested-party-comments/${commentId}/manage-documents/${request.params.folderId}/${request.params.documentId}`,
		nextPageUrl: `/appeals-service/appeal-details/${request.params.appealId}/interested-party-comments/${commentId}/manage-documents/${request.params.folderId}/${request.params.documentId}`
	});
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const getDeleteDocument = async (request, response) => {
	const {
		params: { commentId }
	} = request;

	await renderDeleteDocument({
		request,
		response,
		backButtonUrl: `/appeals-service/appeal-details/${request.params.appealId}/interested-party-comments/${commentId}/manage-documents/{{folderId}}/{{documentId}}`
	});
};
/** @type {import('@pins/express').RequestHandler<Response>} */
export const postDeleteDocumentPage = async (request, response) => {
	const {
		params: { commentId }
	} = request;

	await postDeleteDocument({
		request,
		response,
		returnUrl: `/appeals-service/appeal-details/${request.params.appealId}/interested-party-comments`,
		cancelUrl: `/appeals-service/appeal-details/${request.params.appealId}/interested-party-comments/${commentId}/manage-documents/{{folderId}}/{{documentId}}`,
		uploadNewDocumentUrl: `/appeals-service/appeal-details/${request.params.appealId}/interested-party-comments/add-documents/{{folderId}}`
	});
};
