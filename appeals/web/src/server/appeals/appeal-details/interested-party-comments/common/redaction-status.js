import { appealShortReference } from '#lib/appeals-formatter.js';
import { radiosInput } from '#lib/mappers/index.js';

/** @typedef {import("../../appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {import("../interested-party-comments.types.js").Representation} Representation */
/** @typedef {{ 'redactionStatus': string }} ReqBody */

/**
 * @param {Appeal} appealDetails
 * @param {import('@pins/express').ValidationErrors | undefined} errors
 * @param {string} backLinkUrl
 * @returns {PageContent}
 */
const mapper = (appealDetails, errors, backLinkUrl) => ({
	title: 'Select redaction status',
	backLinkUrl,
	preHeading: `Appeal ${appealShortReference(appealDetails.appealReference)}`,
	heading: 'Select redaction status',
	pageComponents: [
		radiosInput({
			name: 'redactionStatus',
			items: [
				{
					value: 'redacted',
					text: 'Redacted'
				},
				{
					value: 'unredacted',
					text: 'Unredacted'
				},
				{
					value: 'not-required',
					text: 'No redaction required'
				}
			]
		})
	]
});

/**
 * @param {object} options
 * @param {(appealDetails: Appeal, comment: Representation) => string} options.getBackLinkUrl
 * @returns {import('@pins/express').RenderHandler<{}, {}, ReqBody>}
 */
export const renderRedactionStatusFactory =
	({ getBackLinkUrl }) =>
	(request, response) => {
		const backLinkUrl = getBackLinkUrl(request.currentAppeal, request.currentComment);

		const pageContent = mapper(request.currentAppeal, request.errors, backLinkUrl);

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
export const postRedactionStatusFactory =
	({ getRedirectUrl, errorHandler }) =>
	(request, response, next) => {
		if (request.errors) {
			return errorHandler(request, response, next);
		}

		const { currentAppeal, currentComment } = request;

		return response.redirect(getRedirectUrl(currentAppeal, currentComment));
	};
