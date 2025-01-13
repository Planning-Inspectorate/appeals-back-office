import { postRedactionStatusFactory, renderRedactionStatusFactory } from '../../common/index.js';
import { APPEAL_REDACTED_STATUS } from 'pins-data-model';

export const renderRedactionStatus = renderRedactionStatusFactory({
	getBackLinkUrl: (appealDetails, comment) =>
		`/appeals-service/appeal-details/${appealDetails.appealId}/interested-party-comments/${comment.id}/add-document`,
	getValue: (request) =>
		request.session.addDocument?.redactionStatus ||
		request.body.redactionStatus ||
		APPEAL_REDACTED_STATUS.NO_REDACTION_REQUIRED
});

export const postRedactionStatus = postRedactionStatusFactory({
	getRedirectUrl: (appealDetails, comment) =>
		`/appeals-service/appeal-details/${appealDetails.appealId}/interested-party-comments/${comment.id}/add-document/date-submitted`,
	errorHandler: renderRedactionStatus
});
