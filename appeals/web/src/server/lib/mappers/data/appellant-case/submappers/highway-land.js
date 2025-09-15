import { booleanSummaryListItem } from '#lib/mappers/components/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapHighwayLand = ({ appellantCaseData, currentRoute, userHasUpdateCase }) =>
	booleanSummaryListItem({
		id: 'highway-land',
		text: 'Is the appeal site on highway land?',
		value: appellantCaseData.highwayLand,
		defaultText: 'No data',
		link: `${currentRoute}/highway-land/change`,
		editable: userHasUpdateCase
	});
