import { appealShortReference } from '#lib/appeals-formatter.js';
import { dateInput } from '#lib/mappers/index.js';

/** @typedef {import("../../../appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {import('#appeals/appeal-details/representations/types.js').Representation} Representation */
/** @typedef {{ 'day': string, 'month': string, 'year': string }} RequestDate */
/** @typedef {RequestDate} ReqBody */

/**
 * @param {object} options
 * @param {Appeal} options.appealDetails
 * @param {ReqBody} options.date
 * @param {string} options.backLinkUrl
 * @param {string} options.title
 * @param {string} options.legendText
 * @returns {PageContent}
 * */
export const mapper = ({ appealDetails, date, backLinkUrl, title, legendText }) => ({
	title,
	backLinkUrl,
	preHeading: `Appeal ${appealShortReference(appealDetails.appealReference)}`,
	pageComponents: [
		dateInput({
			id: 'date',
			name: 'date',
			value: date,
			legendText,
			legendIsPageHeading: true,
			hint: 'For example, 27 3 2024'
		})
	]
});

/**
 * @param {object} options
 * @param {(request: import('@pins/express').Request) => string} options.getBackLinkUrl
 * @param {(request: import('@pins/express').Request) => RequestDate} options.getValue
 * @param {{ title: string, legendText: string }} options.mapperParams
 * @returns {import('@pins/express').RenderHandler<{}, {}, ReqBody>}
 */
export const renderDateSubmittedFactory =
	({ getBackLinkUrl, getValue, mapperParams: { title, legendText } }) =>
	(request, response) => {
		const backLinkUrl = getBackLinkUrl(request);
		const value = getValue(request);

		const pageContent = mapper({
			appealDetails: request.currentAppeal,
			date: value,
			backLinkUrl,
			title,
			legendText
		});

		return response.status(request.errors ? 400 : 200).render('patterns/change-page.pattern.njk', {
			errors: request.errors,
			pageContent
		});
	};

/**
 * @param {object} options
 * @param {(request: import('@pins/express').Request) => string} options.getRedirectUrl
 * @param {import('@pins/express').RenderHandler<{}, {}, ReqBody>} options.errorHandler
 * @returns {import('@pins/express').RenderHandler<{}, {}, ReqBody>}
 */
export const postDateSubmittedFactory =
	({ getRedirectUrl, errorHandler }) =>
	(request, response, next) => {
		if (request.errors) {
			return errorHandler(request, response, next);
		}

		return response.redirect(getRedirectUrl(request));
	};
