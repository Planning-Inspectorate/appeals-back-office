import {
	renderDateSubmittedFactory,
	postDateSubmittedFactory
} from '#appeals/appeal-details/representations/common/controllers/date-submitted.js';

export const renderDateSubmitted = renderDateSubmittedFactory({
	getBackLinkUrl: (request) =>
		`/appeals-service/appeal-details/${request.currentAppeal.appealId}/interested-party-comments/${request.currentRepresentation.id}/add-document/redaction-status`,
	getValue: (request) => request.session.addDocument || request.body,
	mapperParams: {
		title: 'When did the interested party submit the comment?',
		legendText: 'When did the interested party submit the comment?'
	}
});

export const postDateSubmitted = postDateSubmittedFactory({
	getRedirectUrl: (request) =>
		`/appeals-service/appeal-details/${request.currentAppeal.appealId}/interested-party-comments/${request.currentRepresentation.id}/add-document/check-your-answers`,
	errorHandler: renderDateSubmitted
});
