import { appealShortReference } from '#lib/appeals-formatter.js';

/** @typedef {import("../../appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {import("../interested-party-comments.types.js").Representation} Representation */
/** @typedef {{ 'date-day': string, 'date-month': string, 'date-year': string }} ReqBody */

/**
 * @param {Appeal} appealDetails
 * @param {import('@pins/express').ValidationErrors | undefined} errors
 * @param {{ 'date-day': string, 'date-month': string, 'date-year': string }} date
 * @param {string} backLinkUrl
 * @returns {PageContent}
 * */
export const mapper = (appealDetails, errors, date, backLinkUrl) => ({
	title: 'Enter date submitted',
	backLinkUrl,
	preHeading: `Appeal ${appealShortReference(appealDetails.appealReference)}`,
	heading: 'Enter date submitted',
	pageComponents: [
		{
			type: 'date-input',
			parameters: {
				id: 'date',
				namePrefix: 'date',
				fieldset: {
					legend: {
						text: '',
						classes: 'govuk-fieldset__legend--m'
					}
				},
				hint: {
					text: 'For example, 28 10 2024'
				},
				items: [
					{
						classes: 'govuk-input govuk-date-input__input govuk-input--width-2',
						name: 'day',
						value: date['date-day'] || ''
					},
					{
						classes: 'govuk-input govuk-date-input__input govuk-input--width-2',
						name: 'month',
						value: date['date-month'] || ''
					},
					{
						classes: 'govuk-input govuk-date-input__input govuk-input--width-4',
						name: 'year',
						value: date['date-year'] || ''
					}
				],
				errors
			}
		}
	]
});

/**
 * @param {object} options
 * @param {(appealDetails: Appeal, comment: Representation) => string} options.getBackLinkUrl
 * @returns {import('@pins/express').RenderHandler<{}, {}, ReqBody>}
 */
export const get =
	({ getBackLinkUrl }) =>
	(request, response) => {
		const backLinkUrl = getBackLinkUrl(request.currentAppeal, request.currentComment);

		const pageContent = mapper(request.currentAppeal, request.errors, request.body, backLinkUrl);

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
export const post =
	({ getRedirectUrl, errorHandler }) =>
	(request, response, next) => {
		if (request.errors) {
			return errorHandler(request, response, next);
		}

		const { currentAppeal, currentComment } = request;

		return response.redirect(getRedirectUrl(currentAppeal, currentComment));
	};
