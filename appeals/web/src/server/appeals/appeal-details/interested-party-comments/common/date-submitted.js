import { appealShortReference } from '#lib/appeals-formatter.js';
import { dateInput } from '#lib/mappers/index.js';

/** @typedef {import("../../appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {import('#appeals/appeal-details/representations/types.js').Representation} Representation */
/** @typedef {{ 'day': string, 'month': string, 'year': string }} RequestDate */
/** @typedef {RequestDate} ReqBody */

/**
 * @param {Appeal} appealDetails
 * @param {import('@pins/express').ValidationErrors | undefined} errors
 * @param {ReqBody} date
 * @param {string} backLinkUrl
 * @returns {PageContent}
 * */
export const mapper = (appealDetails, errors, date, backLinkUrl) => ({
	title: 'When did the interested party submit the comment?',
	backLinkUrl,
	preHeading: `Appeal ${appealShortReference(appealDetails.appealReference)}`,
	pageComponents: [
		dateInput({
			id: 'date',
			name: 'date',
			value: date,
			legendText: 'When did the interested party submit the comment?',
			legendIsPageHeading: true,
			hint: 'For example, 27 3 2024'
		})
	]
});

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

		const pageContent = mapper(request.currentAppeal, request.errors, value, backLinkUrl);

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

		const { currentAppeal, currentRepresentation } = request;

		return response.redirect(getRedirectUrl(currentAppeal, currentRepresentation));
	};
