import { appealShortReference } from '#lib/appeals-formatter.js';
import { radiosInput } from '#lib/mappers/index.js';
import { APPEAL_REDACTED_STATUS } from '@planning-inspectorate/data-model';

/** @typedef {import("../../../appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {import('#appeals/appeal-details/representations/types.js').Representation} Representation */
/** @typedef {{ 'redactionStatus': string }} ReqBody */

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
 * @param {(appealDetails: Appeal, comment: Representation) => string} options.getBackLinkUrl,
 * @param {(request: import('@pins/express').Request) => string} options.getValue
 * @returns {import('@pins/express').RenderHandler<{}, {}, ReqBody>}
 */
export const renderRedactionStatusFactory =
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
export const postRedactionStatusFactory =
	({ getRedirectUrl, errorHandler }) =>
	(request, response, next) => {
		if (request.errors) {
			return errorHandler(request, response, next);
		}

		const { currentAppeal, currentRepresentation } = request;

		return response.redirect(getRedirectUrl(currentAppeal, currentRepresentation));
	};
