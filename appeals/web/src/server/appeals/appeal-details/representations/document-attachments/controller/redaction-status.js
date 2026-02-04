import { appealShortReference } from '#lib/appeals-formatter.js';
import { radiosInput } from '#lib/mappers/index.js';
import { backLinkGenerator } from '#lib/middleware/save-back-url.js';
import { preserveQueryString } from '#lib/url-utilities.js';
import { APPEAL_REDACTED_STATUS } from '@planning-inspectorate/data-model';

/** @typedef {import("#appeals/appeal-details/appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {import('#appeals/appeal-details/representations/types.js').Representation} Representation */
/** @typedef {{ 'redactionStatus': string }} ReqBody */

const getBackLinkUrl = backLinkGenerator('addDocument');

export const statusFormatMap = {
	[APPEAL_REDACTED_STATUS.REDACTED]: 'Redacted',
	[APPEAL_REDACTED_STATUS.NOT_REDACTED]: 'Unredacted',
	[APPEAL_REDACTED_STATUS.NO_REDACTION_REQUIRED]: 'No redaction required'
};

export const name = 'redactionStatus';

/**
 * @param {any} maybeRedactionStatus
 * @returns {maybeRedactionStatus is keyof APPEAL_REDACTED_STATUS}
 */
export const isValidRedactionStatus = (maybeRedactionStatus) =>
	Object.keys(statusFormatMap).includes(maybeRedactionStatus);

/**
 * @param {Appeal} appealDetails
 * @param {import('@pins/express').ValidationErrors | undefined} errors
 * @param {string} value
 * @param {string} backLinkUrl
 * @returns {PageContent}
 */
const mapper = (appealDetails, errors, value, backLinkUrl) => ({
	title: 'Redaction status',
	backLinkUrl,
	preHeading: `Appeal ${appealShortReference(appealDetails.appealReference)}`,
	pageComponents: [
		radiosInput({
			name,
			legendText: 'Redaction status',
			legendIsPageHeading: true,
			items: Object.entries(statusFormatMap).map(([value, text]) => ({ value, text })),
			value
		})
	]
});

/**
 * @param {object} options
 * @param {(request: import('@pins/express').Request) => string} options.getValue
 * @returns {import('@pins/express').RenderHandler<{}, {}, ReqBody>}
 */
export const renderRedactionStatusFactory =
	({ getValue }) =>
	(request, response) => {
		const backLinkUrl = getBackLinkUrl(
			request,
			request.baseUrl,
			`${request.baseUrl}/check-your-answers`
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
 * @param {Function} options.errorHandler
 * @returns {import('@pins/express').RenderHandler<{}, {}, ReqBody>}
 */
export const postRedactionStatusFactory =
	({ errorHandler }) =>
	async (request, response, next) => {
		try {
			const baseUrl = request.baseUrl;

			const redirectUrl = preserveQueryString(request, `${baseUrl}/date-submitted`);

			response.redirect(redirectUrl);
		} catch (error) {
			errorHandler(request, response, next);
		}
	};

export const renderRedactionStatus = renderRedactionStatusFactory({
	getValue: (request) =>
		request.session.addDocument?.redactionStatus || request.body.redactionStatus
});

export const postRedactionStatus = postRedactionStatusFactory({
	errorHandler: renderRedactionStatus
});
