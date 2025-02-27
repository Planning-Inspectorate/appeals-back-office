import { textSummaryListItem } from '#lib/mappers/components/index.js';

/** @type {import('../mapper.js').RowMapper} */
export const mapDevelopmentDescription = ({ appellantCaseData, currentRoute, userHasUpdateCase }) =>
	textSummaryListItem({
		id: 'development-description',
		text: 'Original Development description',
		value: appellantCaseData.developmentDescription?.details || 'Not provided',
		link: `${currentRoute}/development-description/change`,
		editable: userHasUpdateCase,
		withShowMore: true,
		showMoreLabelText: 'Original Development description details'
	});
