import { applyEdits } from '#lib/edit-utilities.js';
import { dateSubmitted } from '../../document-attachments/add-document.mapper.js';

/** @typedef {import("../../../appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {import('#appeals/appeal-details/representations/types.js').Representation} Representation */
/** @typedef {{ 'day': string, 'month': string, 'year': string }} RequestDate */
/** @typedef {RequestDate} ReqBody */

/**
 * @param {object} options
 * @param {(appealDetails: Appeal, comment: Representation) => string} options.getBackLinkUrl
 * @param {(request: import('@pins/express').Request) => RequestDate} options.getValue
 * @returns {import('@pins/express').RenderHandler<{}, {}, ReqBody>}
 */
export const renderDateSubmittedFactory =
	({ getBackLinkUrl, getValue }) =>
	(request, response) => {
		const backLinkUrl = getBackLinkUrl(request.currentAppeal, request.currentRepresentation);
		const value = getValue(request);

		const pageContent = dateSubmitted(
			request.currentAppeal,
			request.errors,
			value,
			backLinkUrl,
			{}
		);

		return response.status(request.errors ? 400 : 200).render('patterns/change-page.pattern.njk', {
			errors: request.errors,
			pageContent
		});
	};

/**
 * @param {object} options
 * @param {(appealDetails: Appeal, comment: Representation) => string} options.getRedirectUrl
 * @param {import('@pins/express').RenderHandler<{}, {}, ReqBody>} options.errorHandler
 * @returns {import('@pins/express').RenderHandler<{}, {}, ReqBody>}
 */
export const postDateSubmittedFactory =
	({ getRedirectUrl, errorHandler }) =>
	(request, response, next) => {
		if (request.errors) {
			return errorHandler(request, response, next);
		}

		applyEdits(request, 'addIpComment');

		const { currentAppeal, currentRepresentation } = request;

		return response.redirect(getRedirectUrl(currentAppeal, currentRepresentation));
	};
