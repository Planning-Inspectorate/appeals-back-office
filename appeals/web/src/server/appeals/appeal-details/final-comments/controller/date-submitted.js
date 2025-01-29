/** @typedef {import("../../appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {import('#appeals/appeal-details/representations/types.js').Representation} Representation */
/** @typedef {{ 'day': string, 'month': string, 'year': string }} RequestDate */
/** @typedef {RequestDate} ReqBody */

import { mapper } from '#appeals/appeal-details/representations/interested-party-comments/common/date-submitted.js';

/**
 * @param {object} options
 * @param {(appealDetails: Appeal, comment: Representation, finalCommentsType: string) => string} options.getBackLinkUrl
 * @param {(request: import('@pins/express').Request) => RequestDate} options.getValue
 * @returns {import('@pins/express').RenderHandler<{}, {}, ReqBody>}
 */
export const renderDateSubmittedFactory =
	({ getBackLinkUrl, getValue }) =>
	(request, response) => {
		const { finalCommentsType } = request.params;
		const backLinkUrl = getBackLinkUrl(
			request.currentAppeal,
			request.currentRepresentation,
			finalCommentsType
		);
		const value = getValue(request);

		const pageContent = mapper(request.currentAppeal, request.errors, value, backLinkUrl);

		return response.status(request.errors ? 400 : 200).render('patterns/change-page.pattern.njk', {
			errors: request.errors,
			pageContent
		});
	};

/**
 * @param {object} options
 * @param {(appealDetails: Appeal, comment: Representation, finalCommentsType: string) => string} options.getRedirectUrl
 * @param {Function} options.errorHandler
 * @returns {import('@pins/express').RenderHandler<{}, {}, ReqBody>}
 */
export const postDateSubmittedFactory =
	({ getRedirectUrl, errorHandler }) =>
	async (request, response, next) => {
		const { finalCommentsType } = request.params;
		try {
			const redirectUrl = getRedirectUrl(
				request.currentAppeal,
				request.currentRepresentation,
				finalCommentsType
			);

			response.redirect(redirectUrl);
		} catch (error) {
			errorHandler(request, response, next);
		}
	};

export const renderDateSubmitted = renderDateSubmittedFactory({
	getBackLinkUrl: (appealDetails, comment, finalCommentsType) =>
		`/appeals-service/appeal-details/${appealDetails.appealId}/final-comments/${finalCommentsType}/add-document/redaction-status`,
	getValue: (request) => request.session.addDocument || request.body
});

export const postDateSubmitted = postDateSubmittedFactory({
	getRedirectUrl: (appealDetails, comment, finalCommentsType) =>
		`/appeals-service/appeal-details/${appealDetails.appealId}/final-comments/${finalCommentsType}/add-document/check-your-answers`,
	errorHandler: renderDateSubmitted
});
