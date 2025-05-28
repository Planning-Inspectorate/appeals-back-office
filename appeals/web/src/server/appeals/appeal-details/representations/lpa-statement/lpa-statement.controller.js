import { COMMENT_STATUS, APPEAL_REPRESENTATION_STATUS } from '@pins/appeals/constants/common.js';
import { reviewLpaStatementPage, viewLpaStatementPage } from './lpa-statement.mapper.js';
import { getBackLinkUrlFromQuery } from '#lib/url-utilities.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const renderReviewLpaStatement = async (request, response) => {
	const { errors, currentAppeal, currentRepresentation, session } = request;

	const isReview = [
		APPEAL_REPRESENTATION_STATUS.AWAITING_REVIEW,
		APPEAL_REPRESENTATION_STATUS.INCOMPLETE
	].includes(currentRepresentation.status);

	const pageContent = (isReview ? reviewLpaStatementPage : viewLpaStatementPage)(
		currentAppeal,
		currentRepresentation,
		session,
		getBackLinkUrlFromQuery(request)
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
export const postReviewLpaStatement = async (request, response) => {
	const {
		errors,
		params: { appealId },
		body: { status },
		currentAppeal,
		session
	} = request;

	if (errors) {
		return renderReviewLpaStatement(request, response);
	}

	switch (status) {
		case COMMENT_STATUS.VALID:
			if (!('acceptLPAStatement' in session)) {
				session.acceptLPAStatement = {};
			}
			if (!(currentAppeal.appealId in session['acceptLPAStatement'])) {
				session.acceptLPAStatement[currentAppeal.appealId] = {};
			}
			if (
				!currentAppeal.allocationDetails?.level ||
				!currentAppeal.allocationDetails?.specialisms?.length
			) {
				session.acceptLPAStatement[currentAppeal.appealId].forcedAllocation = true;
				return response.redirect(
					`/appeals-service/appeal-details/${appealId}/lpa-statement/valid/allocation-level`
				);
			}
			delete session.acceptLPAStatement[currentAppeal.appealId].forcedAllocation;
			return response.redirect(
				`/appeals-service/appeal-details/${appealId}/lpa-statement/valid/allocation-check`
			);
		case COMMENT_STATUS.INCOMPLETE:
			return response.redirect(
				`/appeals-service/appeal-details/${appealId}/lpa-statement/incomplete/reasons`
			);
		case COMMENT_STATUS.VALID_REQUIRES_REDACTION:
			return response.redirect(`/appeals-service/appeal-details/${appealId}/lpa-statement/redact`);
		default:
			return response.status(404).render('app/404.njk');
	}
};
