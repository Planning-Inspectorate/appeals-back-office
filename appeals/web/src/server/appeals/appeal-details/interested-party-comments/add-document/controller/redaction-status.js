import { postRedactionStatusFactory, renderRedactionStatusFactory } from '../../common/index.js';

export const renderRedactionStatus = renderRedactionStatusFactory({
	getBackLinkUrl: (appealDetails, comment) =>
		`/appeals-service/appeal-details/${appealDetails.appealId}/interested-party-comments/${comment.id}/add-document`
});

export const postRedactionStatus = postRedactionStatusFactory({
	getRedirectUrl: (appealDetails, comment) =>
		`/appeals-service/appeal-details/${appealDetails.appealId}/interested-party-comments/${comment.id}/add-document/date-submitted`,
	errorHandler: renderRedactionStatus
});
