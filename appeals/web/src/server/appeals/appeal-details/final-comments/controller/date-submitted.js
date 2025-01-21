/** @typedef {import("../../appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {import('#appeals/appeal-details/representations/types.js').Representation} Representation */
/** @typedef {{ 'day': string, 'month': string, 'year': string }} RequestDate */
/** @typedef {RequestDate} ReqBody */

import {
	postDateSubmittedFactory,
	renderDateSubmittedFactory
} from '#appeals/appeal-details/representations/common/controllers/date-submitted.js';

export const renderDateSubmitted = renderDateSubmittedFactory({
	getBackLinkUrl: (request) =>
		`/appeals-service/appeal-details/${request.currentAppeal.appealId}/final-comments/${request.params.finalCommentsType}/add-document/redaction-status`,
	getValue: (request) => request.session.addDocument || request.body,
	mapperParams: {
		// TODO: verify this text against designs
		title: 'When did the LPA submit the comment?',
		legendText: 'When did the LPA submit the comment?'
	}
});

export const postDateSubmitted = postDateSubmittedFactory({
	getRedirectUrl: (request) =>
		`/appeals-service/appeal-details/${request.currentAppeal.appealId}/final-comments/${request.params.finalCommentsType}/add-document/check-your-answers`,
	errorHandler: renderDateSubmitted
});
