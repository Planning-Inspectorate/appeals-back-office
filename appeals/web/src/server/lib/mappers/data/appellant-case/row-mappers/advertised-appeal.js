import { booleanSummaryListItem } from '#lib/mappers/components/index.js';

/** @type {import('../mapper.js').RowMapper} */
export const mapAdvertisedAppeal = ({ appellantCaseData, currentRoute, userHasUpdateCase }) =>
	booleanSummaryListItem({
		id: 'advertised-appeal',
		text: 'Advertised appeal',
		value: appellantCaseData.hasAdvertisedAppeal,
		defaultText: '',
		link: `${currentRoute}/change-appeal-details/advertised-appeal`,
		addCyAttribute: true,
		editable: userHasUpdateCase
	});
