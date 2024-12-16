import { render } from '../common/render.js';
import { reviewLpaStatementPage } from './lpa-statement.mapper.js';

export const renderReviewLpaStatement = render(
	reviewLpaStatementPage,
	'patterns/change-page.pattern.njk',
	'currentRepresentation'
);
