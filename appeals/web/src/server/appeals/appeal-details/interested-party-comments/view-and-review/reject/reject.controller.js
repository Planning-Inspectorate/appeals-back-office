import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import {
	mapRejectionReasonOptionsToCheckboxItemParameters,
	mapRejectionReasonPayload
} from '#appeals/appeal-details/interested-party-comments/view-and-review/page-components/reject.mapper.js';
import {
	getRepresentationRejectionReasonOptions,
	updateRejectionReasons,
	rejectInterestedPartyComment
} from './reject.service.js';
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
	const { currentAppeal, currentComment, apiClient, session, errors } = request;

	if (!currentAppeal || !currentComment) {
		return response.status(404).render('app/404.njk');
	}

	try {
		const rejectionReasons = await getRepresentationRejectionReasonOptions(apiClient);

		const mappedRejectionReasons = mapRejectionReasonOptionsToCheckboxItemParameters(
			currentComment,
			rejectionReasons,
			session,
			errors?.['']
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
		errors
	} = request;

	if (errors) {
		return renderSelectReason(request, response);
	}

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
	const { currentAppeal, currentComment, session, errors } = request;

	if (!currentAppeal || !currentComment) {
		return response.status(404).render('app/404.njk');
	}

	try {
		const pageContent = await rejectAllowResubmitPage(
			request.apiClient,
			currentAppeal,
			currentComment,
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
