import { postDateSubmittedFactory, renderDateSubmittedFactory } from '../../common/index.js';

export const renderDateSubmitted = renderDateSubmittedFactory({
	getBackLinkUrl: (appealDetails, comment) =>
		`/appeals-service/appeal-details/${appealDetails.appealId}/interested-party-comments/${comment.id}/add-document/redaction-status`
});

export const postDateSubmitted = postDateSubmittedFactory({
	getRedirectUrl: (appealDetails, comment) =>
		`/appeals-service/appeal-details/${appealDetails.appealId}/interested-party-comments/${comment.id}/add-document/check-your-answers`,
	errorHandler: renderDateSubmitted
});
