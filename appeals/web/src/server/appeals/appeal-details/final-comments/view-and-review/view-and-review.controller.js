import logger from '#lib/logger.js';
import { reviewFinalCommentsPage } from './view-and-review.mapper.js';

/** @typedef {import("../../appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {import('#appeals/appeal-details/representations/types.js').Representation} Representation */

/**
 *
 * @param {(appealDetails: Appeal, finalCommentsType: string, comments: Representation, session: import('express-session').Session & Record<string, string>) => PageContent} contentMapper
 * @param {string} templatePath
 * @returns {import('@pins/express').RenderHandler<any, any, any>}
 */
export const render = (contentMapper, templatePath) => (request, response) => {
	const { errors, currentRepresentation, currentAppeal, session } = request;

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
		session
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
		const { errors, currentAppeal } = request;

		if (!currentAppeal) {
			logger.error('Current appeal not found.');
			return response.status(500).render('app/500.njk');
		}

		if (errors) {
			return renderReviewFinalComments(request, response, next);
		}

		return renderReviewFinalComments(request, response, next);
	} catch (error) {
		logger.error(error);
		return response.status(500).render('app/500.njk');
	}
};