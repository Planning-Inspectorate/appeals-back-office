import { mapRejectionReasonPayload } from '#appeals/appeal-details/representations/representations.mapper.js';
import { renderSelectRejectionReasons } from '#appeals/appeal-details/representations/common/render-select-rejection-reasons.js';
import { getRepresentationRejectionReasonOptions } from '#appeals/appeal-details/representations/representations.service.js';
import { ensureArray } from '#lib/array-utilities.js';
import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import {
	rejectAllowResubmitPage,
	rejectCheckYourAnswersPage,
	rejectInterestedPartyCommentPage
} from './reject.mapper.js';
import { updateRejectionReasons } from '#appeals/appeal-details/representations/representations.service.js';
import { rejectInterestedPartyComment } from './reject.service.js';

export const renderSelectReason = renderSelectRejectionReasons(rejectInterestedPartyCommentPage);

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * @param {import('express').NextFunction} next
 */
export const postRejectReason = async (request, response, next) => {
	const {
		currentRepresentation,
		params: { appealId, commentId },
		errors
	} = request;

	if (errors) {
		return renderSelectReason(request, response, next);
	}

	if (currentRepresentation.represented.email) {
		return response
			.status(200)
			.redirect(
				`/appeals-service/appeal-details/${appealId}/interested-party-comments/${commentId}/reject/allow-resubmit`
			);
	}

	return response
		.status(200)
		.redirect(
			`/appeals-service/appeal-details/${appealId}/interested-party-comments/${commentId}/reject/check-your-answers`
		);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postRejectInterestedPartyComment = async (request, response) => {
	const {
		params: { appealId, commentId },
		apiClient,
		session
	} = request;

	const rejectionReasons = mapRejectionReasonPayload(session.rejectIpComment);

	try {
		await updateRejectionReasons(apiClient, appealId, commentId, rejectionReasons);
		await rejectInterestedPartyComment(
			apiClient,
			appealId,
			commentId,
			session.rejectIpComment.allowResubmit === 'yes'
		);

		addNotificationBannerToSession(session, 'interestedPartyCommentsRejectedSuccess', appealId);

		delete session.rejectIpComment;

		return response.redirect(
			`/appeals-service/appeal-details/${appealId}/interested-party-comments`
		);
	} catch (error) {
		logger.error(error);
		return response.status(500).render('app/500.njk');
	}
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * */
export const renderAllowResubmit = async (request, response) => {
	const { currentAppeal, currentRepresentation, session, errors } = request;

	if (!currentAppeal || !currentRepresentation) {
		return response.status(404).render('app/404.njk');
	}

	try {
		const pageContent = await rejectAllowResubmitPage(
			request.apiClient,
			currentAppeal,
			currentRepresentation,
			session
		);

		return response.status(200).render('patterns/check-and-confirm-page.pattern.njk', {
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
export const postAllowResubmit = async (request, response) => {
	const {
		errors,
		params: { appealId, commentId }
	} = request;

	if (errors) {
		return renderAllowResubmit(request, response);
	}

	return response.redirect(
		`/appeals-service/appeal-details/${appealId}/interested-party-comments/${commentId}/reject/check-your-answers`
	);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const renderCheckYourAnswers = async (request, response) => {
	const { currentAppeal, currentRepresentation, errors, session } = request;

	const selectedReasons = ensureArray(session.rejectIpComment?.rejectionReason);
	const rejectionReasons = await getRepresentationRejectionReasonOptions(
		request.apiClient,
		currentRepresentation.representationType
	);

	const pageContent = rejectCheckYourAnswersPage(
		currentAppeal,
		currentRepresentation,
		rejectionReasons,
		{
			rejectionReasons: selectedReasons,
			allowResubmit: session.rejectIpComment?.allowResubmit === 'yes'
		}
	);

	return response.status(200).render('patterns/check-and-confirm-page.pattern.njk', {
		errors,
		pageContent
	});
};
