import logger from '#lib/logger.js';
import { COMMENT_STATUS } from '@pins/appeals/constants/common.js';
import { reviewFinalCommentsPage } from './view-and-review.mapper.js';

/** @typedef {import("#appeals/appeal-details/appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {import('#appeals/appeal-details/representations/types.js').Representation} Representation */

/**
 *
 * @param {(appealDetails: Appeal, finalCommentsType: string, comments: Representation, session: import('express-session').Session & Record<string, string>, backUrl: string) => PageContent} contentMapper
 * @param {string} templatePath
 * @returns {import('@pins/express').RenderHandler<any, any, any>}
 */
export const render = (contentMapper, templatePath) => (request, response) => {
	const { errors, currentRepresentation, currentAppeal, session, query } = request;
	const backUrl = query.backUrl ? String(query.backUrl) : '';

	let { finalCommentsType } = request.params;

	if (finalCommentsType === 'lpa') {
		finalCommentsType = 'LPA';
	}

	if (!currentRepresentation) {
		return response.status(404).render('app/404.njk');
	}

	const pageContent = contentMapper(
		currentAppeal,
		finalCommentsType,
		currentRepresentation,
		session,
		backUrl
	);

	return response.status(200).render(templatePath, {
		errors,
		pageContent
	});
};

export const renderReviewFinalComments = render(
	reviewFinalCommentsPage,
	'patterns/display-page.pattern.njk'
);

/**
 * @type {import('@pins/express').RenderHandler<any, any, any>}
 */
export const postReviewFinalComments = async (request, response, next) => {
	try {
		const {
			errors,
			currentAppeal,
			body: { status },
			params: { appealId, finalCommentsType }
		} = request;

		if (!currentAppeal) {
			logger.error('Current appeal not found.');
			return response.status(500).render('app/500.njk');
		}

		if (errors) {
			return renderReviewFinalComments(request, response, next);
		}

		if (status === COMMENT_STATUS.VALID_REQUIRES_REDACTION) {
			return response.redirect(
				`/appeals-service/appeal-details/${appealId}/final-comments/${finalCommentsType}/redact`
			);
		}

		if (status === COMMENT_STATUS.INVALID) {
			return response.redirect(
				`/appeals-service/appeal-details/${appealId}/final-comments/${finalCommentsType}/reject`
			);
		}

		if (status === COMMENT_STATUS.VALID) {
			return response.redirect(
				`/appeals-service/appeal-details/${appealId}/final-comments/${finalCommentsType}/accept`
			);
		}

		return renderReviewFinalComments(request, response, next);
	} catch (error) {
		logger.error(error);
		return response.status(500).render('app/500.njk');
	}
};
