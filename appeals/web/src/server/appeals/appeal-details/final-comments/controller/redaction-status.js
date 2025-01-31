import { appealShortReference } from '#lib/appeals-formatter.js';
import { radiosInput } from '#lib/mappers/index.js';
import { APPEAL_REDACTED_STATUS } from 'pins-data-model';

/** @typedef {import("#appeals/appeal-details/appeal-details.types.js").WebAppeal} Appeal */
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
 * @param {(appealDetails: Appeal, comment: Representation, finalCommentsType: string) => string} options.getBackLinkUrl
 * @param {(request: import('@pins/express').Request) => string} options.getValue
 * @returns {import('@pins/express').RenderHandler<{}, {}, ReqBody>}
 */
export const renderRedactionStatusFactory =
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
export const postRedactionStatusFactory =
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

export const renderRedactionStatus = renderRedactionStatusFactory({
	getBackLinkUrl: (appealDetails, comment, finalCommentsType) =>
		`/appeals-service/appeal-details/${appealDetails.appealId}/final-comments/${finalCommentsType}/add-document`,
	getValue: (request) =>
		request.session.addDocument?.redactionStatus ||
		request.body.redactionStatus ||
		APPEAL_REDACTED_STATUS.NO_REDACTION_REQUIRED
});

export const postRedactionStatus = postRedactionStatusFactory({
	getRedirectUrl: (appealDetails, comment, finalCommentsType) =>
		`/appeals-service/appeal-details/${appealDetails.appealId}/final-comments/${finalCommentsType}/add-document/date-submitted`,
	errorHandler: renderRedactionStatus
});
