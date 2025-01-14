import { COMMENT_STATUS } from '@pins/appeals/constants/common.js';
import { reviewLpaStatementPage, viewLpaStatementPage } from './lpa-statement.mapper.js';

/** @type {import('@pins/express').RequestHandler<{}>} */
export function renderReviewLpaStatement(request, response) {
	const { errors, currentAppeal, currentRepresentation, session } = request;

	const isReview = currentRepresentation.status === 'awaiting_review';

	const pageContent = (isReview ? reviewLpaStatementPage : viewLpaStatementPage)(
		currentAppeal,
		currentRepresentation,
		session
	);

	return response
		.status(200)
		.render(isReview ? 'patterns/change-page.pattern.njk' : 'patterns/display-page.pattern.njk', {
			errors,
			pageContent
		});
}

/** @type {import('@pins/express').RequestHandler<{}>} */
export const postReviewLpaStatement = (request, response) => {
	const {
		errors,
		params: { appealId },
		body: { status }
	} = request;

	if (errors) {
		return renderReviewLpaStatement(request, response);
	}

	switch (status) {
		case COMMENT_STATUS.VALID:
			return response.redirect(
				`/appeals-service/appeal-details/${appealId}/lpa-statement/valid/allocation-check`
			);
		case COMMENT_STATUS.INCOMPLETE:
			return response.redirect(
				`/appeals-service/appeal-details/${appealId}/lpa-statement/incomplete/reasons`
			);
		default:
			return response.status(404).render('app/404.njk');
	}
};
