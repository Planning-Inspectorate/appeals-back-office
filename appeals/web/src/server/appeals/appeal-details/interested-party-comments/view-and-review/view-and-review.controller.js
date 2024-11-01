import logger from '#lib/logger.js';
import {
	mapRejectionReasonOptionsToCheckboxItemParameters,
	mapRejectionReasonPayload
} from '#lib/mappers/page-components/interested-party-comments/view-and-review/reject.mapper.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { COMMENT_STATUS } from '@pins/appeals/constants/common.js';
import {
	rejectInterestedPartyCommentPage,
	reviewInterestedPartyCommentPage,
	viewInterestedPartyCommentPage
} from './view-and-review.mapper.js';
import {
	getRepresentationRejectionReasonOptions,
	patchInterestedPartyCommentStatus,
	updateRejectionReasons
} from './view-and-review.service.js';

/** @typedef {import("../../appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {import("../interested-party-comments.types.js").Representation} Representation */

/**
 *
 * @param {(appealDetails: Appeal, comment: Representation, session: import('express-session').Session & Record<string, string>) => PageContent} contentMapper
 * @param {string} templatePath
 * @returns {import('@pins/express').RenderHandler<unknown>}
 */
export const render = (contentMapper, templatePath) => (request, response) => {
	const { errors, currentComment, currentAppeal, session } = request;

	if (!currentComment) {
		return response.status(404).render('app/404.njk');
	}

	const pageContent = contentMapper(currentAppeal, currentComment, session);

	return response.status(200).render(templatePath, {
		errors,
		pageContent
	});
};

export const renderViewInterestedPartyComment = render(
	viewInterestedPartyCommentPage,
	'patterns/display-page.pattern.njk'
);

export const renderReviewInterestedPartyComment = render(
	reviewInterestedPartyCommentPage,
	'patterns/change-page.pattern.njk'
);

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const renderRejectInterestedPartyComment = async (request, response) => {
	try {
		const { currentAppeal, currentComment, apiClient, errors } = request;

		if (!currentAppeal || !currentComment) {
			return response.status(404).render('app/404.njk');
		}

		const rejectionReasons = await getRepresentationRejectionReasonOptions(apiClient);
		const mappedRejectionReasons = mapRejectionReasonOptionsToCheckboxItemParameters(
			currentComment,
			rejectionReasons
		);

		const pageContent = rejectInterestedPartyCommentPage(currentAppeal);

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
export const postReviewInterestedPartyComment = async (request, response) => {
	try {
		const {
			errors,
			currentAppeal,
			params: { appealId, commentId },
			body: { status },
			apiClient,
			session
		} = request;

		if (!currentAppeal) {
			logger.error('Current appeal not found.');
			return response.status(500).render('app/500.njk');
		}

		if (errors) {
			const pageContent = reviewInterestedPartyCommentPage(
				request.currentAppeal,
				request.currentComment
			);

			return response.status(200).render('patterns/change-page.pattern.njk', {
				errors,
				pageContent
			});
		}

		if (status === COMMENT_STATUS.VALID_REQUIRES_REDACTION) {
			return response.redirect(
				`/appeals-service/appeal-details/${appealId}/interested-party-comments/${commentId}/redact`
			);
		}

		if (status === COMMENT_STATUS.INVALID) {
			return response.redirect(
				`/appeals-service/appeal-details/${appealId}/interested-party-comments/${commentId}/reject`
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

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postRejectInterestedPartyComment = async (request, response) => {
	try {
		const {
			errors,
			currentAppeal,
			currentComment,
			params: { appealId, commentId },
			body,
			apiClient,
			session
		} = request;

		if (!currentAppeal) {
			logger.error('Current appeal not found.');
			return response.status(500).render('app/500.njk');
		}

		if (errors) {
			const pageContent = rejectInterestedPartyCommentPage(request.currentAppeal);

			const rejectionReasons = await getRepresentationRejectionReasonOptions(apiClient);
			const mappedRejectionReasons = mapRejectionReasonOptionsToCheckboxItemParameters(
				currentComment,
				rejectionReasons
			);

			return response.status(200).render('appeals/appeal/reject-ip-comment.njk', {
				errors,
				pageContent,
				rejectionReasons: mappedRejectionReasons
			});
		}

		const rejectionReasons = mapRejectionReasonPayload(body);

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
