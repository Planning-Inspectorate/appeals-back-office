import { COMMENT_STATUS } from '@pins/appeals/constants/common.js';
import { render } from '../common/render.js';
import { reviewLpaStatementPage } from './lpa-statement.mapper.js';

export const renderReviewLpaStatement = render(
	reviewLpaStatementPage,
	'patterns/change-page.pattern.njk',
	'currentRepresentation'
);

/** @type {import('@pins/express').RequestHandler<{}>} */
export const postReviewLpaStatement = (request, response, next) => {
	const {
		errors,
		params: { appealId },
		body: { status }
	} = request;

	if (errors) {
		return renderReviewLpaStatement(request, response, next);
	}

	switch (status) {
		case COMMENT_STATUS.VALID:
			return response.redirect(
				`/appeals-service/appeal-details/${appealId}/lpa-statement/valid/allocation-check`
			);
		case COMMENT_STATUS.INCOMPLETE:
			return response.redirect(
				// TODO: change this to whatever flow page you want to enter as you build out the flow
				`/appeals-service/appeal-details/${appealId}/lpa-statement/incomplete/confirm`
			);
		default:
			return response.status(404).render('app/404.njk');
	}
};
