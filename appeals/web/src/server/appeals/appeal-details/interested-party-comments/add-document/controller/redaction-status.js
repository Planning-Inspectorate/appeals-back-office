import {
	renderRedactionStatusFactory,
	postRedactionStatusFactory
} from '#appeals/appeal-details/representations/common/controllers/redaction-status.js';
import { APPEAL_REDACTED_STATUS } from 'pins-data-model';

export const renderRedactionStatus = renderRedactionStatusFactory({
	getBackLinkUrl: (request) =>
		`/appeals-service/appeal-details/${request.currentAppeal.appealId}/interested-party-comments/${request.currentRepresentation.id}/add-document`,
	getValue: (request) =>
		request.session.addDocument?.redactionStatus ||
		request.body.redactionStatus ||
		APPEAL_REDACTED_STATUS.NO_REDACTION_REQUIRED
});

export const postRedactionStatus = postRedactionStatusFactory({
	getRedirectUrl: (request) =>
		`/appeals-service/appeal-details/${request.currentAppeal.appealId}/interested-party-comments/${request.currentRepresentation.id}/add-document/date-submitted`,
	errorHandler: renderRedactionStatus
});
