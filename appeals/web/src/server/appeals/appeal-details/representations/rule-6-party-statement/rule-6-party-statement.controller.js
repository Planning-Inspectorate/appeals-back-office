import { getBackLinkUrlFromQuery } from '#lib/url-utilities.js';
import { APPEAL_REPRESENTATION_STATUS, COMMENT_STATUS } from '@pins/appeals/constants/common.js';
import {
	reviewRule6PartyStatementPage,
	viewRule6PartyStatementPage
} from './rule-6-party-statement.mapper.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const renderReviewRule6PartyStatement = async (request, response) => {
	const {
		errors,
		currentAppeal,
		currentRepresentation,
		session,
		params: { rule6PartyId }
	} = request;

	const isReview = [
		APPEAL_REPRESENTATION_STATUS.AWAITING_REVIEW,
		APPEAL_REPRESENTATION_STATUS.INCOMPLETE
	].includes(currentRepresentation.status);

	const pageContent = (isReview ? reviewRule6PartyStatementPage : viewRule6PartyStatementPage)(
		currentAppeal,
		currentRepresentation,
		session,
		getBackLinkUrlFromQuery(request),
		rule6PartyId
	);

	return response
		.status(200)
		.render(
			isReview
				? 'patterns/change-page-full-width.pattern.njk'
				: 'patterns/display-page.pattern.njk',
			{
				errors,
				pageContent
			}
		);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postReviewRule6PartyStatement = async (request, response) => {
	const {
		errors,
		params: { appealId, rule6PartyId },
		body: { status },
		currentAppeal,
		session
	} = request;

	if (errors) {
		return renderReviewRule6PartyStatement(request, response);
	}

	switch (status) {
		case COMMENT_STATUS.VALID:
			if (!('acceptRule6PartyStatement' in session)) {
				session.acceptRule6PartyStatement = {};
			}
			if (!(currentAppeal.appealId in session['acceptRule6PartyStatement'])) {
				session.acceptRule6PartyStatement[currentAppeal.appealId] = {};
			}
			if (
				!currentAppeal.allocationDetails?.level ||
				!currentAppeal.allocationDetails?.specialisms?.length
			) {
				session.acceptRule6PartyStatement[currentAppeal.appealId].forcedAllocation = true;
				return response.redirect(
					`/appeals-service/appeal-details/${appealId}/rule-6-party-statement/${rule6PartyId}/valid/allocation-level`
				);
			}
			delete session.acceptRule6PartyStatement[currentAppeal.appealId].forcedAllocation;
			return response.redirect(
				`/appeals-service/appeal-details/${appealId}/rule-6-party-statement/${rule6PartyId}/valid/allocation-check`
			);
		case COMMENT_STATUS.INCOMPLETE:
			return response.redirect(
				`/appeals-service/appeal-details/${appealId}/rule-6-party-statement/${rule6PartyId}/incomplete/reasons`
			);
		case COMMENT_STATUS.VALID_REQUIRES_REDACTION:
			return response.redirect(
				`/appeals-service/appeal-details/${appealId}/rule-6-party-statement/${rule6PartyId}/redact`
			);
		default:
			return response.status(404).render('app/404.njk');
	}
};
