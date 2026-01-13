/** @typedef {import("#appeals/appeal-details/appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {import('#appeals/appeal-details/representations/types.js').Representation} Representation */
/** @typedef {{ 'day': string, 'month': string, 'year': string, 'date-day': string, 'date-month': string, 'date-year': string }} RequestDate */
/** @typedef {RequestDate} ReqBody */

import { applyEdits } from '#lib/edit-utilities.js';
import { backLinkGenerator } from '#lib/middleware/save-back-url.js';
import { dateSubmitted } from '../add-document.mapper.js';

const getBackLinkUrl = backLinkGenerator('addDocument');

/**
 * @param {object} options
 * @param {(request: import('@pins/express').Request) => RequestDate} options.getValue
 * @returns {import('@pins/express').RenderHandler<{}, {}, ReqBody>}
 */
export const renderDateSubmittedFactory =
	({ getValue }) =>
	(request, response) => {
		const baseUrl = request.baseUrl;
		const backLinkUrl = getBackLinkUrl(
			request,
			`${baseUrl}/redaction-status`,
			`${baseUrl}/check-your-answers`
		);

		const pageHeadingTextOverride =
			// @ts-ignore
			request.locals?.pageContent?.dateSubmitted?.pageHeadingTextOverride;

		const dateValue = getValue(request);
		const formattedDate = {
			day: dateValue['date-day'] || dateValue.day || '',
			month: dateValue['date-month'] || dateValue.month || '',
			year: dateValue['date-year'] || dateValue.year || ''
		};
		const pageContent = dateSubmitted(
			request.currentAppeal,
			request.errors,
			formattedDate,
			backLinkUrl,
			{
				pageHeadingTextOverride
			}
		);

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

			applyEdits(request, 'addDocument');

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
