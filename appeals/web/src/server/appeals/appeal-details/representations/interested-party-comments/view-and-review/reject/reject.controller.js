import { mapRejectionReasonPayload } from '#appeals/appeal-details/representations/representations.mapper.js';
import { mapRejectionReasonOptionsToCheckboxItemParameters } from '#appeals/appeal-details/representations/common/render-select-rejection-reasons.js';
import { getRepresentationRejectionReasonOptions } from '#appeals/appeal-details/representations/representations.service.js';
import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import {
	rejectAllowResubmitPage,
	rejectCheckYourAnswersPage,
	rejectInterestedPartyCommentPage
} from './reject.mapper.js';
import { updateRejectionReasons } from '#appeals/appeal-details/representations/representations.service.js';
import { rejectInterestedPartyComment } from './reject.service.js';
import { prepareRejectionReasons } from '#appeals/appeal-details/representations/common/components/reject-reasons.js';

/** @type {import('express').Handler} */
export async function renderSelectReason(request, response) {
	const { currentAppeal, currentRepresentation, apiClient, session, errors } = request;

	const rejectionReasons = await getRepresentationRejectionReasonOptions(
		apiClient,
		currentRepresentation.representationType
	);

	const mappedRejectionReasons = mapRejectionReasonOptionsToCheckboxItemParameters(
		currentRepresentation,
		rejectionReasons,
		session,
		'rejectIpComment',
		errors
	);

	const pageContent = rejectInterestedPartyCommentPage(currentAppeal, currentRepresentation);

	return response.status(200).render('appeals/appeal/reject-representation.njk', {
		errors,
		pageContent,
		rejectionReasons: mappedRejectionReasons
	});
}

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

	await updateRejectionReasons(apiClient, appealId, commentId, rejectionReasons);
	await rejectInterestedPartyComment(
		apiClient,
		appealId,
		commentId,
		session.rejectIpComment.allowResubmit === 'yes',
		session.siteVisitRequested === 'site-visit'
	);

	addNotificationBannerToSession({
		session,
		bannerDefinitionKey: 'interestedPartyCommentsRejectedSuccess',
		appealId
	});

	delete session.rejectIpComment;
	delete session.siteVisitRequested;

	return response.redirect(`/appeals-service/appeal-details/${appealId}/interested-party-comments`);
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
	const { currentAppeal, currentRepresentation, currentFolder, errors, session } = request;

	const reasonOptions = await getRepresentationRejectionReasonOptions(
		request.apiClient,
		currentRepresentation.representationType
	);

	const pageContent = rejectCheckYourAnswersPage(
		currentAppeal,
		currentRepresentation,
		currentFolder.folderId,
		reasonOptions,
		{
			rejectionReasons: prepareRejectionReasons(
				session.rejectIpComment,
				session.rejectIpComment.rejectionReason,
				reasonOptions
			),
			allowResubmit: session.rejectIpComment?.allowResubmit === 'yes'
		}
	);

	return response.status(200).render('patterns/check-and-confirm-page-full-width.pattern.njk', {
		errors,
		pageContent
	});
};
