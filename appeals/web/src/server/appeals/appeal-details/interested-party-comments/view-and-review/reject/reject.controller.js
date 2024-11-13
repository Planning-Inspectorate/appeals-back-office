import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { COMMENT_STATUS } from '@pins/appeals/constants/common.js';
import {
	mapRejectionReasonOptionsToCheckboxItemParameters,
	mapRejectionReasonPayload
} from '#appeals/appeal-details/interested-party-comments/view-and-review/page-components/reject.mapper.js';
import {
	getRepresentationRejectionReasonOptions,
	updateRejectionReasons
} from './reject.service.js';
import { patchInterestedPartyCommentStatus } from '../view-and-review.service.js';
import {
	rejectInterestedPartyCommentPage,
	rejectAllowResubmitPage,
	rejectCheckYourAnswersPage
} from './reject.mapper.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const renderSelectReason = async (request, response) => {
	const { currentAppeal, currentComment, apiClient, errors } = request;

	if (!currentAppeal || !currentComment) {
		return response.status(404).render('app/404.njk');
	}

	try {
		const rejectionReasons = await getRepresentationRejectionReasonOptions(apiClient);
		const mappedRejectionReasons = mapRejectionReasonOptionsToCheckboxItemParameters(
			currentComment,
			rejectionReasons,
      errors
        ? { optionId: parseInt(errors[''].value.rejectionReason), message: errors[''].msg }
        : undefined
		);

		const pageContent = rejectInterestedPartyCommentPage(currentAppeal, currentComment);

		return response.status(200).render('appeals/appeal/reject-ip-comment.njk', {
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
		currentComment,
		params: { appealId, commentId },
		errors,
		session,
		body
	} = request;

	if (errors) {
		return renderSelectReason(request, response);
	}

	session.rejectIpComment = body;

	if (currentComment.represented.email) {
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
		await patchInterestedPartyCommentStatus(apiClient, appealId, commentId, COMMENT_STATUS.INVALID);

		addNotificationBannerToSession(session, 'interestedPartyCommentsRejectedSuccess', appealId);

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
	const { currentAppeal, currentComment, errors } = request;

	if (!currentAppeal || !currentComment) {
		return response.status(404).render('app/404.njk');
	}

	try {
		const pageContent = await rejectAllowResubmitPage(
			request.apiClient,
			currentAppeal,
			currentComment
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
		session,
		params: { appealId, commentId },
		body
	} = request;

	if (errors) {
		return renderAllowResubmit(request, response);
	}

	session.rejectIpComment.allowResubmit = body.allowResubmit;

	return response.redirect(
		`/appeals-service/appeal-details/${appealId}/interested-party-comments/${commentId}/reject/check-your-answers`
	);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const renderCheckYourAnswers = async (request, response) => {
	const { currentAppeal, currentComment, errors, session } = request;

	const rejectionReasons = await getRepresentationRejectionReasonOptions(request.apiClient);
	const selectedReasons = Array.isArray(session.rejectIpComment?.rejectionReason)
		? session.rejectIpComment?.rejectionReason
		: [session.rejectIpComment?.rejectionReason];

	const pageContent = rejectCheckYourAnswersPage(currentAppeal, currentComment, rejectionReasons, {
		rejectionReasons: selectedReasons,
		allowResubmit: session.rejectIpComment?.allowResubmit === 'yes'
	});

	return response.status(200).render('patterns/check-and-confirm-page.pattern.njk', {
		errors,
		pageContent
	});
};
