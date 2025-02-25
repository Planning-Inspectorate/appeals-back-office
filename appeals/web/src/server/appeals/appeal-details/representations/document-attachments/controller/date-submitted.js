/** @typedef {import("#appeals/appeal-details/appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {import('#appeals/appeal-details/representations/types.js').Representation} Representation */
/** @typedef {{ 'day': string, 'month': string, 'year': string }} RequestDate */
/** @typedef {RequestDate} ReqBody */

import { mapper } from '#appeals/appeal-details/representations/interested-party-comments/common/date-submitted.js';

/**
 * @param {object} options
 * @param {(request: import('@pins/express').Request) => RequestDate} options.getValue
 * @returns {import('@pins/express').RenderHandler<{}, {}, ReqBody>}
 */
export const renderDateSubmittedFactory =
	({ getValue }) =>
	(request, response) => {
		const baseUrl = request.baseUrl;
		const backLinkUrl = `${baseUrl}/redaction-status`;

		const value = getValue(request);

		const pageContent = mapper(request.currentAppeal, request.errors, value, backLinkUrl);

		return response.status(request.errors ? 400 : 200).render('patterns/change-page.pattern.njk', {
			errors: request.errors,
			pageContent
		});
	};

/**
 * @param {object} options
 * @param {Function} options.errorHandler
 * @returns {import('@pins/express').RenderHandler<{}, {}, ReqBody>}
 */
export const postDateSubmittedFactory =
	({ errorHandler }) =>
	async (request, response, next) => {
		try {
			if (request.errors) {
				return errorHandler(request, response, next);
			}
			const baseUrl = request.baseUrl;
			const redirectUrl = `${baseUrl}/check-your-answers`;

			response.redirect(redirectUrl);
		} catch (error) {
			errorHandler(request, response, next);
		}
	};

export const renderDateSubmitted = renderDateSubmittedFactory({
	getValue: (request) => request.session.addDocument || request.body
});

export const postDateSubmitted = postDateSubmittedFactory({
	errorHandler: renderDateSubmitted
});
