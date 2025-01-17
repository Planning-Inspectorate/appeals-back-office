import logger from '#lib/logger.js';
import { updateRejectionReasons } from '#appeals/appeal-details/representations/representations.service.js';
import { patchFinalCommentsStatus } from '../view-and-review/view-and-review.service.js';
import { COMMENT_STATUS } from '@pins/appeals/constants/common.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import {
	mapRejectionReasonOptionsToCheckboxItemParameters,
	mapRejectionReasonPayload
} from '#appeals/appeal-details/representations/representations.mapper.js';
import { getRepresentationRejectionReasonOptions } from './reject.service.js';
import { rejectFinalCommentsPage, confirmRejectFinalCommentPage } from './reject.mapper.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const renderSelectReason = async (request, response) => {
	const {
		currentAppeal,
		currentRepresentation,
		params: { finalCommentsType },
		apiClient,
		session,
		errors
	} = request;

	if (!currentAppeal || !currentRepresentation) {
		return response.status(404).render('app/404.njk');
	}

	try {
		const rejectionReasons = await getRepresentationRejectionReasonOptions(
			apiClient,
			finalCommentsType
		);

		const mappedRejectionReasons = mapRejectionReasonOptionsToCheckboxItemParameters(
			currentRepresentation,
			rejectionReasons,
			session,
			'rejectFinalComments',
			errors?.['']
				? { optionId: parseInt(errors[''].value.rejectionReason), message: errors[''].msg }
				: undefined
		);

		const pageContent = rejectFinalCommentsPage(currentAppeal, finalCommentsType);

		return response.status(200).render('appeals/appeal/reject-representation.njk', {
			errors,
			pageContent,
			rejectionReasons: mappedRejectionReasons
		});
	} catch (error) {
		logger.error(error);
		return response.status(500).render('app/500.njk');
	}
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postRejectReason = async (request, response) => {
	const {
		params: { appealId, finalCommentsType },
		errors
	} = request;

	if (errors) {
		return renderSelectReason(request, response);
	}

	return response
		.status(200)
		.redirect(
			`/appeals-service/appeal-details/${appealId}/final-comments/${finalCommentsType}/reject/confirm`
		);
};

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getConfirmRejectFinalComment = async (request, response) => {
	const {
		errors,
		currentRepresentation,
		currentAppeal,
		session,
		params: { finalCommentsType },
		apiClient
	} = request;

	if (!currentRepresentation || !session.rejectFinalComments) {
		logger.warn('No currentRepresentation or rejectFinalComments in request or session');
		return response.status(500).render('app/500.njk');
	}

	try {
		const rejectionReasons = await getRepresentationRejectionReasonOptions(
			apiClient,
			finalCommentsType
		);

		const pageContent = confirmRejectFinalCommentPage(
			currentAppeal,
			currentRepresentation,
			finalCommentsType,
			session,
			rejectionReasons
		);

		return response.status(200).render('patterns/display-page.pattern.njk', {
			errors,
			pageContent
		});
	} catch (error) {
		logger.error(error);
		return response.status(500).render('app/500.njk');
	}
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postConfirmRejectFinalComment = async (request, response) => {
	const {
		currentRepresentation,
		params: { appealId, finalCommentsType },
		session,
		apiClient
	} = request;

	if (!currentRepresentation || !session.rejectFinalComments) {
		logger.warn('No currentRepresentation or rejectFinalComments in request or session');
		return response.status(500).render('app/500.njk');
	}

	const rejectionReasons = mapRejectionReasonPayload(session.rejectFinalComments);

	await Promise.all([
		updateRejectionReasons(apiClient, appealId, String(currentRepresentation.id), rejectionReasons),
		patchFinalCommentsStatus(
			apiClient,
			appealId,
			String(currentRepresentation.id),
			COMMENT_STATUS.INVALID
		)
	]);

	delete session.rejectFinalComments;

	const notificationBannerKey =
		finalCommentsType === 'appellant'
			? 'finalCommentsAppellantRejectionSuccess'
			: 'finalCommentsLPARejectionSuccess';

	addNotificationBannerToSession(session, notificationBannerKey, appealId);

	return response.redirect(`/appeals-service/appeal-details/${appealId}`);
};
